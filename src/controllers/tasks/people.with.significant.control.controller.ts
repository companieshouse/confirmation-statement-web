import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, PSC_STATEMENT_PATH, TASK_LIST_PATH, URL_QUERY_PARAM } from "../../types/page.urls";
import {
  appointmentTypeNames,
  appointmentTypes,
  PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
  RADIO_BUTTON_VALUE,
  SECTIONS,
  WRONG_DETAILS_INCORRECT_PSC,
  WRONG_DETAILS_UPDATE_PSC } from "../../utils/constants";
import {
  PersonOfSignificantControl,
  SectionStatus
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { getPscs } from "../../services/psc.service";
import { createAndLogError, logger } from "../../utils/logger";
import { toReadableFormat } from "../../utils/date";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { formatPSCForDisplay, formatAddressForDisplay } from "../../utils/format";
import { FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 } from "../../utils/properties";
import { isActiveFeature } from "../../utils/feature.flag";
import {
  getRadioButtonInvalidValueErrorMessage,
  isRadioButtonValueValid
} from "../../validators/radio.button.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscs: PersonOfSignificantControl[] | undefined = await getPscData(req);
    if (!pscs) {
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      logger.info(`No PSC data returned for company ${companyNumber}, redirecting to PSC Statement page`);
      return res.redirect(getPscStatementUrl(req, false));
    }
    const pscList = formatPscList(pscs);
    return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      pscList: pscList,
      templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL,
      MultiplePscFlag: FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButtonValue = req.body.pscRadioValue;

    if (!isRadioButtonValueValid(pscButtonValue)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(pscButtonValue)));
    }
    if (!pscButtonValue) {
      const pscs: PersonOfSignificantControl[] | undefined = await getPscData(req);
      if (!pscs) {
        throw createAndLogError(`No PSC data found, no radio button selected`);
      }
      const pscList = formatPscList(pscs);
      return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        pscList: pscList,
        templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL,
        peopleWithSignificantControlErrorMsg: PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
        MultiplePscFlag: FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021
      });
    }

    if (pscButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_PSC,
        pageHeading: WRONG_DETAILS_INCORRECT_PSC,
      });
    }

    return res.redirect(getPscStatementUrl(req, true));
  } catch (e) {
    return next(e);
  }
};

const getPscData = async (req: Request): Promise<PersonOfSignificantControl[] | undefined> => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, transactionId, submissionId);

  if (!pscs || pscs.length === 0) {
    return undefined;
  }

  if (isActiveFeature(FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021)) {
    if (pscs.length > 5) {
      throw createAndLogError(`More than five, (${pscs.length}) PSC returned for company ${companyNumber}`);
    }
  } else {
    if (pscs.length > 1) {
      throw createAndLogError(`More than one (${pscs.length}) PSC returned for company ${companyNumber}`);
    }
  }


  return pscs;
};

const getPscTypeTemplate = (pscAppointmentType: string): string => {
  switch (pscAppointmentType) {
      case appointmentTypes.INDIVIDUAL_PSC: return appointmentTypeNames.PSC;
      case appointmentTypes.RLE_PSC: return appointmentTypeNames.RLE;
      case appointmentTypes.LEGAL_PERSON_PSC: return appointmentTypeNames.ORP;
      default: throw createAndLogError(`Unknown PSC type: ${pscAppointmentType}`);
  }
};

const handleDateOfBirth = (pscAppointmentType: string, psc: PersonOfSignificantControl): string => {
  if (pscAppointmentType === appointmentTypeNames.RLE || pscAppointmentType === appointmentTypeNames.ORP) {
    return "";
  }
  if (psc.dateOfBirthIso) {
    return toReadableFormat(psc.dateOfBirthIso);
  }
  throw createAndLogError(`Date of birth missing for individual psc name ${psc.nameElements?.forename} ${psc.nameElements?.surname}`);
};

const getPscStatementUrl = (req: Request, isPscFound: boolean) => {
  const path = urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req);
  return urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, isPscFound.toString());
};

const formatPscList = (pscs: PersonOfSignificantControl[]) => {
  const pscList = new Array(0);
  for (const psc of pscs) {
    const formattedPsc: PersonOfSignificantControl = formatPSCForDisplay(psc);
    const ura = formattedPsc.address ? formatAddressForDisplay(formattedPsc.address) : "";
    const serviceAddress = formattedPsc.serviceAddress ? formatAddressForDisplay(formattedPsc.serviceAddress) : "";
    const pscTemplateType: string = getPscTypeTemplate(psc.appointmentType);
    const dob = handleDateOfBirth(pscTemplateType, psc);
    const dateOfAppointment = toReadableFormat(psc.appointmentDate);
    const pscObj = {
      formattedPsc: formattedPsc,
      ura: ura,
      serviceAddress: serviceAddress,
      pscTemplateType: pscTemplateType,
      dob: dob,
      dateOfAppointment: dateOfAppointment,
    };
    pscList.push(pscObj);
  }
  return pscList;
};

