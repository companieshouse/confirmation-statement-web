import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, PSC_STATEMENT_PATH, TASK_LIST_PATH } from "../../types/page.urls";
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
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { getPscs } from "../../services/psc.service";
import { createAndLogError, logger } from "../../utils/logger";
import { toReadableFormatMonthYear } from "../../utils/date";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const psc: PersonOfSignificantControl | undefined = await getPscData(req);
    if (!psc) {
      logger.info("No PSC data returned, redirecting to PSC Statement page")
       return res.redirect(urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req));
    }
    const pscAppointmentType = psc.appointmentType;
    const pscTemplateType: string = getPscTypeTemplate(pscAppointmentType);
    return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      dob: handleDateOfBirth(pscTemplateType, psc),
      psc,
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

    if (!pscButtonValue) {
      const psc: PersonOfSignificantControl = await getPscData(req) as PersonOfSignificantControl;
      const pscAppointmentType = psc.appointmentType;
      const pscTemplateType: string = getPscTypeTemplate(pscAppointmentType);
      return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        dob: handleDateOfBirth(pscTemplateType, psc),
        peopleWithSignificantControlErrorMsg: PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
        psc,
        pscTemplateType,
        templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL
      });
    }

    if (pscButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SectionStatus.NOT_CONFIRMED, SECTIONS.PSC);
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

    await sendUpdate(req, sectionStatus, SECTIONS.PSC);
    return res.redirect(urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req));
  } catch (e) {
    return next(e);
  }
};

const getPscData = async (req: Request): Promise<PersonOfSignificantControl | undefined> => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, companyNumber);

  if (!pscs || pscs.length ===0) {
    return undefined
  }

  if (pscs.length > 1) {
    throw createAndLogError(`More than one (${pscs.length}) PSC returned for company ${companyNumber}`);
  }

  return pscs[0];
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
