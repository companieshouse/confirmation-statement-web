import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficersDetailsData } from "../../services/active.officers.details.service";
import { LOCALE_EN, OFFICER_ROLE } from "../../utils/constants";
import { formatAddress, formatAddressForDisplay, formatTitleCase } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    const naturalSecretaryList = buildSecretaryList(officers);
    const corporateSecretaryList = buildCorporateOfficerList(officers, OFFICER_ROLE.SECRETARY);
    const naturalDirectorList = buildDirectorList(officers);
    const corporateDirectorList = buildCorporateOfficerList(officers, OFFICER_ROLE.DIRECTOR);

    return res.render(Templates.ACTIVE_OFFICERS_DETAILS, {
      templateName: Templates.ACTIVE_OFFICERS_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      naturalSecretaryList,
      corporateSecretaryList,
      naturalDirectorList,
      corporateDirectorList
    });
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
        surname: officer.surname.toLocaleUpperCase(LOCALE_EN),
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
        identificationType: officer.identificationType,
        lawGoverned: formatTitleCase(officer.lawGoverned),
        legalForm: formatTitleCase(officer.legalForm),
        placeRegistered: formatTitleCase(officer.placeRegistered),
        registrationNumber: officer.registrationNumber,
        serviceAddress: formatAddressForDisplay(formatAddress(officer.serviceAddress)),
        surname: officer.surname.toLocaleUpperCase(LOCALE_EN),
      };
    });
};

const buildDirectorList = (officers: ActiveOfficerDetails[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, OFFICER_ROLE.DIRECTOR) && !officer.isCorporate)
    .map(officer => {
      return {
        forename: formatTitleCase(officer.foreName1),
        surname: officer.surname.toLocaleUpperCase(LOCALE_EN),
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

const equalsIgnoreCase = (officerRole: string, wantedOfficerRole: OFFICER_ROLE): boolean => {
  return wantedOfficerRole.localeCompare(officerRole, LOCALE_EN, { sensitivity: 'accent' }) === 0;
};
