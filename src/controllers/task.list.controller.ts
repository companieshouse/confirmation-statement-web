import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { TaskList } from "../types/task.list";
import { initTaskList } from "../services/task.list.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { REVIEW_PATH, TRADING_STATUS_PATH } from "../types/page.urls";
import { isInFuture, toReadableFormat } from "../utils/date";
import { createAndLogError, logger } from "../utils/logger";
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

    const registeredEmailAddressOptionEnabled: boolean = enableRegisteredEmailAdressOption(company);

    return res.render(Templates.TASK_LIST, {
      backLinkUrl,
      company,
      taskList,
      reviewUrl,
      registeredEmailAddressOptionEnabled,
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

const enableRegisteredEmailAdressOption = (company: CompanyProfile): boolean => {
  const ecctStartDateAsString: string = process.env.FEATURE_FLAG_ECCT_START_DATE_14082023 as string;
  if (!ecctStartDateAsString) {
    return false;
  }

  if (!isValidDate(ecctStartDateAsString)) {
    logger.info(`Environment Variable "FEATURE_FLAG_ECCT_START_DATE_14082023" must be in yyyy-mm-dd format`);
    return false;
  }

  const ecctStartDate: Date = new Date(ecctStartDateAsString);
  const statementDate: Date = new Date(company.confirmationStatement?.nextMadeUpTo as string);

  return statementDate >= ecctStartDate;
};

const isValidDate = (dateAsString: string): boolean => {
  return  !isNaN(Date.parse(dateAsString));
};
