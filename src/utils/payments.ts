import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Response } from "express";
import { startPaymentsSession } from "../services/payment.service";
import { closeTransaction } from "../services/transaction.service";
import { CONFIRMATION_STATEMENT } from "../types/page.urls";
import { links } from "./constants";
import { createAndLogError } from "./logger";
import { urlUtils } from "./url";

export const executePaymentJourney = async (
  session: Session, res: Response<any, Record<string, any>>, next: NextFunction,
  companyNumber: string, transactionId: string, submissionId: string, nextPage: string ) => {

  let paymentUrl: string | undefined;

  try {
    paymentUrl = await closeTransaction(
      session,
      companyNumber,
      submissionId,
      transactionId
    );
  } catch (err) {
    return next(err);
  }

  if (!paymentUrl) {
    return res.redirect(
      urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
        nextPage,
        companyNumber,
        transactionId,
        submissionId
      )
    );
  } else {
    // Payment required kick off payment journey
    const paymentResourceUri: string = `/transactions/${transactionId}/payment`;

    const paymentResponse: ApiResponse<Payment> =
      await startPaymentsSession(
        session,
        paymentUrl,
        paymentResourceUri,
        submissionId,
        transactionId,
        companyNumber
      );

    if (!paymentResponse.resource?.links?.journey) {
      return next(createAndLogError("No resource in payment response"));
    }

    res.redirect(paymentResponse.resource.links.journey);
  }
};

export const isPaymentDue = (transaction: Transaction, submissionId: string): boolean => {
  if (!transaction.resources) {
    return false;
  }
  const resourceKeyName = Object.keys(transaction.resources).find(key => key.endsWith(`${CONFIRMATION_STATEMENT}/${submissionId}`));
  if (!resourceKeyName) {
    return false;
  }
  return transaction.resources[resourceKeyName].links?.[links.COSTS];
};
