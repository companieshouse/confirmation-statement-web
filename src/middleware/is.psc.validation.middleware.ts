import { NextFunction, Request, Response } from "express";
import { URL_QUERY_PARAM } from "../types/page.urls";
import { isPscFlagValid } from "../validators/is.psc.validator";
import { logger } from "../utils/logger";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const isPscQueryParameterValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Execute isPsc query parameter validation middleware checks");

  const isPsc: string = req.query[URL_QUERY_PARAM.IS_PSC] as string;

  if (!isPsc) {
    // No validation applies if the 'isPsc' query parameter isn't present in the request (URL)
    return next();
  }

  logger.debug("Check isPsc");
  if (!isPscFlagValid(isPsc)) {
    urlUtils.sanitiseReqlUrls(req);
    logger.errorRequest(req, "No valid isPsc query parameter supplied: " + req.originalUrl);
    return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  }

  return next();
};
