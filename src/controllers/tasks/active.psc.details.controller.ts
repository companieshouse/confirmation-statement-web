import { NextFunction, Request, Response } from "express";
import { PSC_STATEMENT_PATH, TASK_LIST_PATH, URL_QUERY_PARAM } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { PersonOfSignificantControl } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getPscs } from "../../services/psc.service";
import { Session } from "@companieshouse/node-session-handler";
import { appointmentTypes } from "../../utils/constants";
import {
  equalsIgnoreCase,
  formatAddressForDisplay,
  formatPSCForDisplay,
  formatTitleCase,
  toUpperCase
} from "../../utils/format";
import { toReadableFormat } from "../../utils/date";
import { logger } from "../../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, transactionId, submissionId);
    if (pscs.length < 1) {
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      logger.info(`No PSC data returned for company ${companyNumber}, redirecting to PSC Statement page`);
      return res.redirect(getPscStatementUrl(req, false));
    }
    const pscLists = buildPscLists(pscs);
    return res.render(Templates.ACTIVE_PSC_DETAILS, {
      templateName: Templates.ACTIVE_PSC_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      pscList: pscLists.individualPscList,
      relevantLegalEntityList: pscLists.relevantLegalEntityList,
      otherRegistrablePersonList: pscLists.otherRegistrablePersonList
    });
  } catch (e) {
    return next(e);
  }
};

const getPscStatementUrl = (req: Request, isPscFound: boolean) => {
  const path = urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req);
  return urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, isPscFound.toString());
};

const buildPscLists = (pscs: PersonOfSignificantControl[]): any => {
  return {
    individualPscList: buildIndividualPscList(pscs),
    relevantLegalEntityList: buildRlePscList(pscs),
    otherRegistrablePersonList: buildOrpPscList(pscs)
  };
};

const buildIndividualPscList = (pscs: PersonOfSignificantControl[]): any[] => {
  return pscs
    .filter(psc => equalsIgnoreCase(psc.appointmentType, appointmentTypes.INDIVIDUAL_PSC))
    .map(psc  => {
      const formattedPsc: PersonOfSignificantControl = formatPSCForDisplay(psc);
      const ura = formattedPsc.address ? formatAddressForDisplay(formattedPsc.address) : "";
      const serviceAddress = formattedPsc.serviceAddress ? formatAddressForDisplay(formattedPsc.serviceAddress) : "";
      const dob = psc.dateOfBirthIso ? toReadableFormat(psc.dateOfBirthIso) : "";
      const dateOfAppointment = toReadableFormat(psc.appointmentDate);
      return {
        formattedPsc: formattedPsc,
        ura: ura,
        serviceAddress: serviceAddress,
        dob: dob,
        dateOfAppointment: dateOfAppointment
      };
    });
};

const buildRlePscList = (pscs: PersonOfSignificantControl[]): any[] => {
  return pscs
    .filter(psc => equalsIgnoreCase(psc.appointmentType, appointmentTypes.RLE_PSC))
    .map(psc => {
      const formattedPsc: PersonOfSignificantControl = formatPSCForDisplay(psc);
      const dateOfAppointment = toReadableFormat(psc.appointmentDate);
      const serviceAddress = formattedPsc.serviceAddress ? formatAddressForDisplay(formattedPsc.serviceAddress) : "";
      const registrationNumber = psc.registrationNumber;
      const registerLocation = psc.registerLocation;
      return {
        formattedPsc: formattedPsc,
        dateOfAppointment: dateOfAppointment,
        serviceAddress: serviceAddress,
        registerLocation: registerLocation,
        registrationNumber: registrationNumber
      };
    });
};

const buildOrpPscList = (pscs: PersonOfSignificantControl[]): any[] => {
  return pscs
    .filter(psc => equalsIgnoreCase(psc.appointmentType, appointmentTypes.LEGAL_PERSON_PSC))
    .map(psc => {
      const formattedPsc: PersonOfSignificantControl = formatPSCForDisplay(psc);
      return {
        formattedPsc: formattedPsc,
        dateOfAppointment: toReadableFormat(psc.appointmentDate),
        serviceAddress: formattedPsc.serviceAddress ? formatAddressForDisplay(formattedPsc.serviceAddress) : "",
        legalForm: toUpperCase(psc.legalForm),
        lawGoverned: formatTitleCase(psc.lawGoverned),
      };
    });
};
