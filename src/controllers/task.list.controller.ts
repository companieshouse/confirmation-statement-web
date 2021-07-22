import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { TaskList } from "../types/task.list";
import { initTaskList } from "../services/task.list.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { isInFuture, toReadableFormat } from "../utils/date";
import { createAndLogError } from "../utils/logger";
import { urlUtils } from "../utils/url";
import { getConfirmationStatement } from "../services/confirmation.statement.service";
import { Session } from "@companieshouse/node-session-handler";
import { ConfirmationStatementSubmission } from "private-api-sdk-node/dist/services/confirmation-statement";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const backLinkUrl = urlUtils
      .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, companyNumber, transactionId, submissionId);
    const company: CompanyProfile = await getCompanyProfile(companyNumber);

    const confirmationStatement: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);

    const taskList: TaskList = initTaskList(company.companyNumber, transactionId, submissionId, confirmationStatement);
    taskList.recordDate = calculateFilingDate(taskList.recordDate, company);

    return res.render(Templates.TASK_LIST, {
      backLinkUrl,
      company,
      taskList
    });
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
