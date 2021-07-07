import { postTransaction } from "../services/transaction.service";
import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../utils/url";
import { TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { DESCRIPTION, REFERENCE } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const session = req.session as Session;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE);

    const nextPageUrl = urlUtils.getUrlWithCompanyNumber(TRADING_STATUS_PATH, companyNumber);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};
