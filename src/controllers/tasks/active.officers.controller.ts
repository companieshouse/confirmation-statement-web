import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { ACTIVE_OFFICERS_PATH, TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { OFFICER_DETAILS_ERROR, RADIO_BUTTON_VALUE, sessionCookieConstants } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficerDetailsData } from "../../services/active.officer.details.service";
import { formatTitleCase } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = getTransactionId(req);
    const submissionId = getSubmissionId(req);
    const session: Session = req.session as Session;
    const activeOfficerDetails: ActiveOfficerDetails = await getActiveOfficerDetailsData(session, companyNumber);
    req.sessionCookie[sessionCookieConstants.ACTIVE_OFFICER_DETAILS_KEY] = activeOfficerDetails;
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
  const companyNumber = getCompanyNumber(req);
  const transactionId = getTransactionId(req);
  const submissionId = getSubmissionId(req);
  try {
    const activeOfficerDetailsBtnValue = req.body.activeDirectors;
    if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId));
    } else if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
        return res.render(Templates.WRONG_OFFICERS, {
          backLinkUrl: urlUtils.getUrlWithCompanyNumber(ACTIVE_OFFICERS_PATH, companyNumber),
          templateName: Templates.WRONG_OFFICERS,
        });
    } else {
      const activeOfficerDetails: ActiveOfficerDetails = req.sessionCookie[sessionCookieConstants.ACTIVE_OFFICER_DETAILS_KEY];
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
const getTransactionId = (req: Request): string => req.params[urlParams.PARAM_TRANSACTION_ID];
const getSubmissionId = (req: Request): string => req.params[urlParams.PARAM_SUBMISSION_ID];
