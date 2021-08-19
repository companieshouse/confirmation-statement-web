import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, PSC_STATEMENT_PATH, TASK_LIST_PATH, urlParams, URL_QUERY_PARAM } from "../../types/page.urls";
import {
  appointmentTypeNames,
  appointmentTypes,
  PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
  RADIO_BUTTON_VALUE,
  WRONG_DETAILS_INCORRECT_PSC,
  WRONG_DETAILS_UPDATE_PSC } from "../../utils/constants";
import {
  ConfirmationStatementSubmission,
  PersonOfSignificantControl,
  PersonsOfSignificantControlData,
  SectionStatus
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { getConfirmationStatement, updateConfirmationStatement } from "../../services/confirmation.statement.service";
import { getPscs } from "../../services/psc.service";
import { createAndLogError, logger } from "../../utils/logger";
import { toReadableFormatMonthYear } from "../../utils/date";
import { formatTitleCase } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const psc: PersonOfSignificantControl | undefined = await getPscData(req);
    if (!psc) {
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      logger.info(`No PSC data returned for company ${companyNumber}, redirecting to PSC Statement page`);
      return res.redirect(getPscStatementUrl(req, false));
    }
    const pscAppointmentType = psc.appointmentType;
    const pscTemplateType: string = getPscTypeTemplate(pscAppointmentType);
    const formattedPsc: PersonOfSignificantControl = formatPSCForDisplay(psc);

    return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      dob: handleDateOfBirth(pscTemplateType, psc),
      psc: formattedPsc,
      pscTemplateType,
      templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL,
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButtonValue = req.body.pscRadioValue;
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];

    if (!pscButtonValue) {
      const psc: PersonOfSignificantControl = await getPscData(req) as PersonOfSignificantControl;
      const pscAppointmentType = psc.appointmentType;
      const formattedPsc: PersonOfSignificantControl = formatPSCForDisplay(psc);
      const pscTemplateType: string = getPscTypeTemplate(pscAppointmentType);
      return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        dob: handleDateOfBirth(pscTemplateType, psc),
        peopleWithSignificantControlErrorMsg: PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
        psc: formattedPsc,
        pscTemplateType,
        templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL
      });
    }

    if (pscButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(transactionId, submissionId, req, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_PSC,
        pageHeading: WRONG_DETAILS_INCORRECT_PSC,
      });
    }

    const sectionStatus: SectionStatus = RADIO_BUTTON_VALUE.YES === pscButtonValue ?
      SectionStatus.CONFIRMED : SectionStatus.RECENT_FILING;

    await sendUpdate(transactionId, submissionId, req, sectionStatus);
    return res.redirect(getPscStatementUrl(req, true));
  } catch (e) {
    return next(e);
  }
};

const getPscData = async (req: Request): Promise<PersonOfSignificantControl | undefined> => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, companyNumber);

  if (!pscs || pscs.length === 0) {
    return undefined;
  }

  if (pscs.length > 1) {
    throw createAndLogError(`More than one (${pscs.length}) PSC returned for company ${companyNumber}`);
  }

  return pscs[0];
};

const sendUpdate = async (transactionId: string, submissionId: string, req: Request, status: SectionStatus) => {
  const session = req.session as Session;
  const currentCsSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
  const csSubmission = updateCsSubmission(currentCsSubmission, status);
  await updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
};

const updateCsSubmission = (currentCsSubmission: ConfirmationStatementSubmission, status: SectionStatus):
  ConfirmationStatementSubmission => {
  const newPSCData: PersonsOfSignificantControlData = {
    sectionStatus: status
  };

  if (!currentCsSubmission.data) {
    currentCsSubmission.data = {};
  }

  currentCsSubmission.data.personsSignificantControlData = newPSCData;

  return currentCsSubmission;
};

const getPscTypeTemplate = (pscAppointmentType: string): string => {
  switch (pscAppointmentType) {
      case appointmentTypes.INDIVIDUAL_PSC: return appointmentTypeNames.PSC;
      case appointmentTypes.RLE_PSC: return appointmentTypeNames.RLE;
      default: throw createAndLogError(`Unknown PSC type: ${pscAppointmentType}`);
  }
};

const handleDateOfBirth = (pscAppointmentType: string, psc: PersonOfSignificantControl): string => {
  if (pscAppointmentType === appointmentTypeNames.RLE) {
    return "";
  }
  if (psc.dateOfBirth?.month && psc.dateOfBirth.year) {
    return toReadableFormatMonthYear(psc.dateOfBirth.month, psc.dateOfBirth.year);
  }
  throw createAndLogError(`Date of birth missing for individual psc name ${psc.nameElements?.forename} ${psc.nameElements?.surname}`);
};

const getPscStatementUrl = (req: Request, isPscFound: boolean) => {
  const path = urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req);
  return urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, isPscFound.toString());
};

const formatPSCForDisplay = (psc: PersonOfSignificantControl): PersonOfSignificantControl => {
  const clonedPsc: PersonOfSignificantControl = JSON.parse(JSON.stringify(psc));
  if (psc.nameElements) {
    clonedPsc.nameElements = {
      forename: formatTitleCase(psc.nameElements?.forename),
      otherForenames: psc.nameElements?.otherForenames,
      surname: psc.nameElements?.surname,
      middleName: psc.nameElements?.middleName,
      title: psc.nameElements?.title
    };
  }

  if (psc.address) {
    clonedPsc.address = {
      addressLine1: formatTitleCase(psc.address.addressLine1),
      addressLine2: formatTitleCase(psc.address.addressLine2),
      careOf: formatTitleCase(psc.address.careOf),
      country: formatTitleCase(psc.address.country),
      locality: formatTitleCase(psc.address.locality),
      poBox: formatTitleCase(psc.address.poBox),
      postalCode: psc.address.postalCode,
      premises: formatTitleCase(psc.address.premises),
      region: formatTitleCase(psc.address.region)
    };
  }

  clonedPsc.serviceAddressLine1 = formatTitleCase(psc.serviceAddressLine1);
  clonedPsc.serviceAddressPostTown = formatTitleCase(psc.serviceAddressPostTown);

  return clonedPsc;
};
