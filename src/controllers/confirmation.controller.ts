import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    return res.render(Templates.CONFIRMATION, {
      referenceNumber: transactionId,
    });
  } catch (e) {
    return next(e);
  }
};

