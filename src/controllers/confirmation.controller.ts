import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "services/company.profile.service";
import { Templates } from "types/template.paths";
import { toReadableFormat } from "utils/date";
import { urlUtils } from "utils/url";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { getTransaction } from "services/transaction.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const company: CompanyProfile = await getCompanyProfile(companyNumber);

    const transaction: Transaction = await getTransaction(session, transactionId);

    return res.render(Templates.CONFIRMATION, {
      nextDueDate: toReadableFormat(company.confirmationStatement?.nextDue as string),
    });
  } catch (e) {
    return next(e);
  }
};

// const isTransactionOpen = (transaction: Transaction, submissionId: string): boolean => {
//   if (!transaction) {
//     return false;
//   }
//   if (!(transaction.status = "closed")) {
//     return true;
//   } else {
//     return false;
//   }
// }
