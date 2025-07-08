import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { ACCOUNTS_SIGNOUT_PATH } from "../types/page.urls";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const session = req.session as Session;
    const userEmail = session.data.signin_info?.user_profile?.email;
    return res.render(Templates.CONFIRMATION, {
      signoutURL: ACCOUNTS_SIGNOUT_PATH,
      referenceNumber: transactionId,
      userEmail
    });
  } catch (e) {
    return next(e);
  }
};

