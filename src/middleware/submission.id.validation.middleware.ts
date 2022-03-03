import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { isUrlIdValid } from "../validators/url.id.validator";
import { urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Templates } from "../types/template.paths";

export const submissionIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Execute URL submission id validation middleware checks");

  const submissionId: string = req.params[urlParams.PARAM_SUBMISSION_ID];

  logger.debug("Check submission id");
  if (!isUrlIdValid(submissionId)) {
    urlUtils.sanitiseReqlUrls(req);
    logger.errorRequest(req, `No Valid Submission Id in URL: ${req.originalUrl}`);
    return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  }

  return next();
};
