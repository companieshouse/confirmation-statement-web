import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import {Session} from "@companieshouse/node-session-handler";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const session = req.session as Session;
    const userEmail = session.data.signin_info?.user_profile?.email;
    return res.render(Templates.CONFIRMATION, {
      referenceNumber: transactionId,
      userEmail
    });
  } catch (e) {
    return next(e);
  }
};

