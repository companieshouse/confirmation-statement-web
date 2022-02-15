import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH, WRONG_OFFICER_DETAILS_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails, SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficersDetailsData } from "../../services/active.officers.details.service";
import {
  OFFICER_DETAILS_ERROR,
  OFFICER_ROLE,
  RADIO_BUTTON_VALUE,
  SECTIONS
} from "../../utils/constants";
import {
  equalsIgnoreCase,
  formatAddress,
  formatAddressForDisplay,
  formatTitleCase,
  toUpperCase
} from "../../utils/format";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { lookupIdentificationType } from "../../utils/api.enumerations";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    const officerLists = buildOfficerLists(officers);

    return res.render(Templates.ACTIVE_OFFICERS_DETAILS, {
      templateName: Templates.ACTIVE_OFFICERS_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      naturalSecretaryList: officerLists.naturalSecretaryList,
      corporateSecretaryList: officerLists.corporateSecretaryList,
      naturalDirectorList: officerLists.naturalDirectorList,
      corporateDirectorList: officerLists.corporateDirectorList
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const officersDetailsBtnValue = req.body.activeOfficers;
    if (officersDetailsBtnValue === RADIO_BUTTON_VALUE.YES || officersDetailsBtnValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (officersDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.NOT_CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(WRONG_OFFICER_DETAILS_PATH, req));
    } else {
      const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
      const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
      const session: Session = req.session as Session;
      const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
      const officerLists = buildOfficerLists(officers);
      return res.render(Templates.ACTIVE_OFFICERS_DETAILS, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        officerErrorMsg: OFFICER_DETAILS_ERROR,
        templateName: Templates.ACTIVE_OFFICERS_DETAILS,
        naturalSecretaryList: officerLists.naturalSecretaryList,
        corporateSecretaryList: officerLists.corporateSecretaryList,
        naturalDirectorList: officerLists.naturalDirectorList,
        corporateDirectorList: officerLists.corporateDirectorList
      });
    }
  } catch (e) {
    return next(e);
  }
};

const buildSecretaryList = (officers: ActiveOfficerDetails[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, OFFICER_ROLE.SECRETARY) && !officer.isCorporate)
    .map(officer => {
      return {
        forename: formatTitleCase(officer.foreName1),
        surname: toUpperCase(officer.surname),
        dateOfAppointment: officer.dateOfAppointment,
        serviceAddress: formatAddressForDisplay(formatAddress(officer.serviceAddress))
      };
    });
};

const buildCorporateOfficerList = (officers: ActiveOfficerDetails[], wantedOfficerRole: OFFICER_ROLE): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, wantedOfficerRole) && officer.isCorporate)
    .map(officer => {
      return {
        dateOfAppointment: officer.dateOfAppointment,
        forename: formatTitleCase(officer.foreName1),
        identificationType: officer.identificationType ? lookupIdentificationType(officer.identificationType) : "",
        lawGoverned: formatTitleCase(officer.lawGoverned),
        legalForm: toUpperCase(officer.legalForm),
        placeRegistered: formatTitleCase(officer.placeRegistered),
        registrationNumber: officer.registrationNumber,
        serviceAddress: formatAddressForDisplay(formatAddress(officer.serviceAddress)),
        surname: toUpperCase(officer.surname),
      };
    });
};

const buildDirectorList = (officers: ActiveOfficerDetails[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, OFFICER_ROLE.DIRECTOR) && !officer.isCorporate)
    .map(officer => {
      return {
        forename: formatTitleCase(officer.foreName1),
        surname: toUpperCase(officer.surname),
        occupation: formatTitleCase(officer.occupation),
        nationality: formatTitleCase(officer.nationality),
        dateOfBirth: officer.dateOfBirth,
        dateOfAppointment: officer.dateOfAppointment,
        countryOfResidence: formatTitleCase(officer.countryOfResidence),
        serviceAddress: formatAddressForDisplay(formatAddress(officer.serviceAddress)),
        residentialAddress: formatAddressForDisplay(formatAddress(officer.residentialAddress))
      };
    });
};

const buildOfficerLists = (officers: ActiveOfficerDetails[]): any => {
  return {
    naturalSecretaryList: buildSecretaryList(officers),
    corporateSecretaryList: buildCorporateOfficerList(officers, OFFICER_ROLE.SECRETARY),
    naturalDirectorList: buildDirectorList(officers),
    corporateDirectorList: buildCorporateOfficerList(officers, OFFICER_ROLE.DIRECTOR),
  };
};
