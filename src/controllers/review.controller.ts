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
import { createAndLogError, logger } from "../utils/logger";
import { links, CONFIRMATION_STATEMENT_ERROR, LAWFUL_ACTIVITY_STATEMENT_ERROR } from "../utils/constants";
import { toReadableFormat } from "../utils/date";
import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement } from "../services/confirmation.statement.service";
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
    const backLinkUrl = urlUtils
      .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId);

    const company: CompanyProfile = await getCompanyProfile(companyNumber);

    const transaction: Transaction = await getTransaction(session, transactionId);

    const csSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);

    const paymentUrl: string | undefined = await closeTransaction(session, companyNumber, submissionId, transactionId);

    const statementDate: Date = new Date(company.confirmationStatement?.nextMadeUpTo as string);
    const ecctEnabled: boolean = ecctDayOneEnabled(statementDate);


    const confirmationCheckboxValue = req.body.confirmationStatement;
    logger.debug(`Checking statement checkbox value: ${confirmationCheckboxValue}`);
    const lawfulActivityCheckboxValue = req.body.lawfulActivityStatement;
    logger.debug(`Checking lawful activity checkbox value: ${lawfulActivityCheckboxValue}`);

    const confirmationValid = isStatementCheckboxTicked("Confirmation", confirmationCheckboxValue);
    const lawfulActivityValid = isStatementCheckboxTicked("Lawful Activity", lawfulActivityCheckboxValue);

    const statementErrors: string[] = new Array(2);
    if (!confirmationValid) {
      statementErrors[0] = CONFIRMATION_STATEMENT_ERROR;
    }
    if (!lawfulActivityValid) {
      statementErrors[1] = LAWFUL_ACTIVITY_STATEMENT_ERROR;
    }

    if (!confirmationValid || !lawfulActivityValid) {
      return res.render(Templates.REVIEW, {
        backLinkUrl,
        company,
        nextMadeUpToDate: toReadableFormat(csSubmission.data?.confirmationStatementMadeUpToDate),
        isPaymentDue: isPaymentDue(transaction, submissionId),
        ecctEnabled,
        statementErrors
      });
    }

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

const isStatementCheckboxTicked = (checkboxName: string, checkboxValue: string): boolean => {
  logger.debug(`Checking ${checkboxName} statement checkbox is ticked`);

  if (checkboxValue === "true") {
    return true;
  }

  return false;
};
