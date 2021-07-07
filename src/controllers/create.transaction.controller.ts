import { postTransaction } from "../services/transaction.service";
import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../utils/url";
import { TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { DESCRIPTION, REFERENCE } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import {createConfirmationStatement} from "../services/confirmation.statement.service";
import {Transaction} from "@companieshouse/api-sdk-node/dist/services/transaction/types";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const session = req.session as Session;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const transaction: Transaction = await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE);
    const transactionId = transaction.id as string;
    const submissionResponse = await createConfirmationStatement(session, transactionId)
    if (submissionResponse.httpStatusCode === 201) {
      const nextPageUrl = urlUtils.getUrlWithCompanyNumber(TRADING_STATUS_PATH, companyNumber);
      return res.redirect(nextPageUrl);
    }
    return next(new Error("Company is ineligible " + JSON.stringify(submissionResponse)));
  } catch (e) {
    return next(e);
  }
};
