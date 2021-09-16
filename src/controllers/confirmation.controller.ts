import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { REVIEW_PATH } from "../types/page.urls";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const paymentStatus = req.query.status;
    if (paymentStatus === "paid") {
      const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
      return res.render(Templates.CONFIRMATION, {
        referenceNumber: transactionId,
      });
    } else {
      logger.info("Payment status: " + paymentStatus + " - redirecting to the review page");
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
      const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
      return res.redirect(urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(REVIEW_PATH, companyNumber, transactionId, submissionId));
    }
  } catch (e) {
    return next(e);
  }
};

