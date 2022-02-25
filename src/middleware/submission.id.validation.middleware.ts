import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { isUrlIdValid } from "../validators/url.id.validator";
import { urlParams } from "../types/page.urls";
import { URL_LOG_LENGTH } from "../utils/constants";
import { urlUtils } from "../utils/url";
import { Templates } from "../types/template.paths";

export const submissionIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Execute URL submission id validation middleware checks");

  const submissionId: string = req.params[urlParams.PARAM_SUBMISSION_ID];

  logger.debug("Check submission id");
  if (!isUrlIdValid(submissionId)) {
    // need to truncate the url in the request as we are about to log it out and it has failed validation.
    // it could contain a large amount of data so truncate to stop logs filling up
    urlUtils.truncateRequestUrl(req);
    logger.infoRequest(req, "No Valid Submission Id in URL: " + req.originalUrl.substring(0, URL_LOG_LENGTH));
    return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  }

  return next();
};
