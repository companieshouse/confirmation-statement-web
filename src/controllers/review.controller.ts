import { NextFunction, Request, Response } from "express";
import { getTransaction } from "../services/transaction.service";
import { Session } from "@companieshouse/node-session-handler";
import { TASK_LIST_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { links } from "../utils/constants";

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
}
