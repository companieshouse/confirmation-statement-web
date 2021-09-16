import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../utils/url";
import { logger } from "../utils/logger";
import { CONFIRMATION_PATH, REVIEW_PATH } from "../types/page.urls";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const paymentStatus = req.query.status;
    if (paymentStatus === "paid") {
      logger.info("Payment status: " + paymentStatus + " - redirecting to the confirmation page");
      return res.redirect(urlUtils.getUrlToPath(CONFIRMATION_PATH, req));
    } else {
      logger.info("Payment status: " + paymentStatus + " - redirecting to the review page");
      return res.redirect(urlUtils.getUrlToPath(REVIEW_PATH, req));
    }
  } catch (e) {
    return next(e);
  }
};
