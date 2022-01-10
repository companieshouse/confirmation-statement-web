import { NextFunction, Request, Response } from "express";
import {
  TASK_LIST_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficersDetailsData } from "../../services/active.officers.details.service";
import { OFFICER_ROLE } from "../../utils/constants";
import { formatAddress, formatAddressForDisplay, formatTitleCase } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    const naturalSecretaryList = buildSecretaryList(officers);

    return res.render(Templates.ACTIVE_OFFICERS_DETAILS, {
      templateName: Templates.ACTIVE_OFFICERS_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      naturalSecretaryList,
    });
  } catch (e) {
    return next(e);
  }
};

const buildSecretaryList = (officers: ActiveOfficerDetails[]): any[] => {
  return officers
    .filter(officer => OFFICER_ROLE.SECRETARY.localeCompare(officer.role, 'en', { sensitivity: 'accent' }) === 0 && !officer.isCorporate)
    .map(officer => {
      return {
        forename: formatTitleCase(officer.foreName1),
        surname: officer.surname,
        dateOfAppointment: officer.dateOfAppointment,
        serviceAddress: formatAddressForDisplay(formatAddress(officer.serviceAddress))
      };
    });
};
