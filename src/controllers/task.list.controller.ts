import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { TaskList } from "../types/task.list";
import { initTaskList } from "../services/task.list.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { REVIEW_PATH, TRADING_STATUS_PATH } from "../types/page.urls";
import { isInFuture, toReadableFormat } from "../utils/date";
import { createAndLogError } from "../utils/logger";
import { urlUtils } from "../utils/url";
import { getConfirmationStatement } from "../services/confirmation.statement.service";
import { Session } from "@companieshouse/node-session-handler";
import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const reviewUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REVIEW_PATH, companyNumber, transactionId, submissionId);
    const backLinkUrl = urlUtils
      .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, companyNumber, transactionId, submissionId);
    const company: CompanyProfile = await getCompanyProfile(companyNumber);

    const confirmationStatement: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);

    const taskList: TaskList = initTaskList(company.companyNumber, transactionId, submissionId, confirmationStatement);
    taskList.recordDate = calculateFilingDate(taskList.recordDate, company);

    return res.render(Templates.TASK_LIST, {
      backLinkUrl,
      company,
      taskList,
      reviewUrl,
      templateName: Templates.TASK_LIST
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

    return res.redirect(urlUtils
      .getUrlWithCompanyNumberTransactionIdAndSubmissionId(REVIEW_PATH, companyNumber, transactionId, submissionId));
  } catch (e) {
    return next(e);
  }
};

const calculateFilingDate = (recordDate: string, companyProfile: CompanyProfile): string => {
  const nextMadeUpToDate = companyProfile.confirmationStatement?.nextMadeUpTo;
  if (nextMadeUpToDate) {
    if (isInFuture(nextMadeUpToDate)) {
      return recordDate;
    } else {
      return toReadableFormat(nextMadeUpToDate);
    }
  }
  throw createAndLogError(`Company Profile is missing confirmationStatement info for company number: ${companyProfile.companyNumber}`);
};
