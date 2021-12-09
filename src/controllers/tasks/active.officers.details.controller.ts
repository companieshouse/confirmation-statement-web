import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OFFICER_TYPE } from "../../utils/constants";
import { getActiveOfficersDetailsData, getOfficerTypeList } from "../../services/active.officers.details.service";
import { CORPORATE_DIRECTORS_PATH, CORPORATE_SECRETARIES_PATH, NATURAL_PERSON_DIRECTORS_PATH, NATURAL_PERSON_SECRETARIES_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { createAndLogError } from "../../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    const officerTypeList = getOfficerTypeList(officers);

    if (officerTypeList.length === 0) {
      throw createAndLogError(`No officers type found, transaction_id = ${transactionId}, submission_id = ${submissionId}`);
    }
    if (officerTypeList.includes(OFFICER_TYPE.NATURAL_SECRETARY)){
      return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_SECRETARIES_PATH, req));
    }
    if (officerTypeList.includes(OFFICER_TYPE.CORPORATE_SECRETARIES)){
      return res.redirect(urlUtils.getUrlToPath(CORPORATE_SECRETARIES_PATH, req));
    }
    if (officerTypeList.includes(OFFICER_TYPE.NATURAL_DIRECTOR)){
      return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_DIRECTORS_PATH, req));
    }
    if (officerTypeList.includes(OFFICER_TYPE.CORPORATE_DIRECTORS)){
      return res.redirect(urlUtils.getUrlToPath(CORPORATE_DIRECTORS_PATH, req));
    }

  } catch (e) {
    return next(e);
  }
};
