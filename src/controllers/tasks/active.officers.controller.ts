import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { OFFICER_DETAILS_ERROR, RADIO_BUTTON_VALUE } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficerDetailsData } from "../../services/active.officer.details.service";
import { formatTitleCase } from "../../utils/format";

let activeOfficerDetails: ActiveOfficerDetails;

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const session: Session = req.session as Session;
    activeOfficerDetails = await getActiveOfficerDetailsData(session, companyNumber);
    activeOfficerDetails.foreName1 = formatTitleCase(activeOfficerDetails.foreName1);
    if (activeOfficerDetails.foreName2) {
      activeOfficerDetails.foreName2 = formatTitleCase(activeOfficerDetails.foreName2);
    }

    return res.render(Templates.ACTIVE_OFFICERS, {
      templateName: Templates.ACTIVE_OFFICERS,
      backLinkUrl: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
      activeOfficerDetails
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOfficerDetailsBtnValue = req.body.activeDirectors;
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];

    if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId));
    } else {
      return res.render(Templates.ACTIVE_OFFICERS, {
        backLinkUrl: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
        officerErrorMsg: OFFICER_DETAILS_ERROR,
        templateName: Templates.ACTIVE_OFFICERS,
        activeOfficerDetails
      });
    }
  } catch (e) {
    return next(e);
  }
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
