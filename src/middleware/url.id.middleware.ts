import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { isUrlIdValid } from "../validators/url.id.validator";
import { urlParams } from "../types/page.urls";

export const urlIdMiddleware = (req: Request, res: Response, next: NextFunction) => {

  // TODO This class needs to be unit-tested

  logger.debug("Execute URL id middleware checks");

  const transactionId: string = req.params[urlParams.PARAM_TRANSACTION_ID];

  logger.debug("Check transaction id");
  if (!isUrlIdValid(transactionId)) {
    // TODO What should be done here and how? Entire parameter values appear (embedded) in the output URL but we truncate
    //      them if too long when the validator logs them. In the block below too...
    logger.errorRequest(req, "No Valid Transaction Id in URL: " + req.originalUrl);
    return next(new Error("No Valid Transaction Id in Request"));
  }

  const submissionId: string = req.params[urlParams.PARAM_SUBMISSION_ID];

  logger.debug("Check submission id");
  if (!isUrlIdValid(submissionId)) {
    logger.errorRequest(req, "No Valid Submission Id in URL: " + req.originalUrl);
    return next(new Error("No Valid Submission Id in Request"));
  }

  return next();
};
