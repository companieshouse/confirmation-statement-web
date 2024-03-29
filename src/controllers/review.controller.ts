import { NextFunction, Request, Response } from "express";
import { closeTransaction, getTransaction } from "../services/transaction.service";
import { Session } from "@companieshouse/node-session-handler";
import { CONFIRMATION_PATH, CONFIRMATION_STATEMENT, TASK_LIST_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { startPaymentsSession } from "../services/payment.service";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { createAndLogError } from "../utils/logger";
import { links, CONFIRMATION_STATEMENT_ERROR, LAWFUL_ACTIVITY_STATEMENT_ERROR } from "../utils/constants";
import { toReadableFormat } from "../utils/date";
import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement } from "../services/confirmation.statement.service";
import { sendLawfulPurposeStatementUpdate } from "../utils/update.confirmation.statement.submission";
import { ecctDayOneEnabled } from "../utils/feature.flag";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const backLinkUrl = urlUtils
      .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId);

    const company: CompanyProfile = await getCompanyProfile(companyNumber);

    const transaction: Transaction = await getTransaction(session, transactionId);

    const csSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);

    const statementDate: Date = new Date(company.confirmationStatement?.nextMadeUpTo as string);
    const ecctEnabled: boolean = ecctDayOneEnabled(statementDate);

    return res.render(Templates.REVIEW, {
      backLinkUrl,
      company,
      nextMadeUpToDate: toReadableFormat(csSubmission.data?.confirmationStatementMadeUpToDate),
      isPaymentDue: isPaymentDue(transaction, submissionId),
      ecctEnabled
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    const transaction: Transaction = await getTransaction(session, transactionId);
    const csSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);

    const statementDate: Date = new Date(company.confirmationStatement?.nextMadeUpTo as string);
    const ecctEnabled: boolean = ecctDayOneEnabled(statementDate);

    if (ecctEnabled) {

      const confirmationCheckboxValue = req.body.confirmationStatement;
      const lawfulActivityCheckboxValue = req.body.lawfulActivityStatement;

      const confirmationValid = isStatementCheckboxTicked(confirmationCheckboxValue);
      const lawfulActivityValid = isStatementCheckboxTicked(lawfulActivityCheckboxValue);

      let confirmationStatementError: string = "";
      if (!confirmationValid) {
        confirmationStatementError = CONFIRMATION_STATEMENT_ERROR;
      }

      let lawfulActivityStatementError: string = "";
      if (!lawfulActivityValid) {
        lawfulActivityStatementError = LAWFUL_ACTIVITY_STATEMENT_ERROR;
      }

      if (!confirmationValid || !lawfulActivityValid) {
        return res.render(Templates.REVIEW, {
          backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
          company,
          nextMadeUpToDate: toReadableFormat(csSubmission.data?.confirmationStatementMadeUpToDate),
          isPaymentDue: isPaymentDue(transaction, submissionId),
          ecctEnabled,
          confirmationStatementError,
          lawfulActivityStatementError
        });
      }

      await sendLawfulPurposeStatementUpdate(req, true);

    }

    const paymentUrl: string | undefined = await closeTransaction(session, companyNumber, submissionId, transactionId);

    if (!paymentUrl) {
      return res.redirect(urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(CONFIRMATION_PATH, companyNumber, transactionId, submissionId));
    } else {
      // Payment required kick off payment journey
      const paymentResourceUri: string = `/transactions/${transactionId}/payment`;

      const paymentResponse: ApiResponse<Payment> = await startPaymentsSession(session, paymentUrl,
                                                                               paymentResourceUri, submissionId,
                                                                               transactionId, companyNumber);

      if (!paymentResponse.resource) {
        return next(createAndLogError("No resource in payment response"));
      }

      res.redirect(paymentResponse.resource.links.journey);
    }

  } catch (e) {
    return next(e);
  }
};

const isPaymentDue = (transaction: Transaction, submissionId: string): boolean => {
  if (!transaction.resources) {
    return false;
  }
  const resourceKeyName = Object.keys(transaction.resources).find(key => key.endsWith(`${CONFIRMATION_STATEMENT}/${submissionId}`));
  if (!resourceKeyName) {
    return false;
  }
  return transaction.resources[resourceKeyName].links?.[links.COSTS];
};

const isStatementCheckboxTicked = (checkboxValue: string): boolean => {

  if (checkboxValue === "true") {
    return true;
  }

  return false;
};
