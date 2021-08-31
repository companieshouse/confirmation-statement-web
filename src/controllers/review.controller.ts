import { NextFunction, Request, Response } from "express";
import { closeTransaction, getTransaction } from "../services/transaction.service";
import { Session } from "@companieshouse/node-session-handler";
import { TASK_LIST_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { links } from "../utils/constants";
import { startPaymentsSession } from "../services/payment.service";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { createAndLogError } from "../utils/logger";

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
    const isPaymentDue: boolean = transaction.links?.[links.COSTS];
    return res.render(Templates.REVIEW, {
      backLinkUrl,
      company,
      isPaymentDue
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
    const paymentUrl: string | undefined = await closeTransaction(session, companyNumber, submissionId, transactionId);

    if (!paymentUrl) {
      // No payment required skip to confirmation of submission
      return next(createAndLogError("Not yet supported"));
    } else {
      // Payment required kick off payment journey
      const resourceUri: string = `/transactions/${transactionId}/confirmation-statement/${submissionId}`;
      const paymentResponse: ApiResponse<Payment> = await startPaymentsSession(session, paymentUrl, resourceUri);

      if (!paymentResponse.resource) {
        return next(createAndLogError("No resource in payment response"));
      }

      res.redirect(paymentResponse.resource.links.journey);
    }

  } catch (e) {
    return next(e);
  }
};
