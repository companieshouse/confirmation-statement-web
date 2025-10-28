import { NextFunction, Request, Response } from "express";
import { PAYMENT_NONCE_SESSION_KEY } from "../utils/constants";
import { urlUtils } from "../utils/url";
import { createAndLogError, logger } from "../utils/logger";
import { CONFIRMATION_PATH, REVIEW_PATH } from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const paymentStatus = req.query.status;
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const returnedState = req.query.state;
    const savedState = session.getExtraData(PAYMENT_NONCE_SESSION_KEY);

    logger.debug(`Returned state: ${returnedState}, saved state: ${savedState}`);

    if (!savedState || savedState !== returnedState) {
      return next(createAndLogError("Returned state does not match saved state, rejecting redirect"));
    }

    if (paymentStatus === "paid") {
      logger.debug("Submission id: " + submissionId + " - Payment status: " + paymentStatus + " - redirecting to the confirmation page");
      return res.redirect(urlUtils.getUrlToPath(CONFIRMATION_PATH, req));
    } else {
      logger.debug("Submission id: " + submissionId + " - Payment status: " + paymentStatus + " - redirecting to the review page");
      return res.redirect(urlUtils.getUrlToPath(REVIEW_PATH, req));
    }
  } catch (e) {
    return next(e);
  }
};
