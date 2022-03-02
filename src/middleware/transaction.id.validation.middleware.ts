import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { isUrlIdValid } from "../validators/url.id.validator";
import { urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Templates } from "../types/template.paths";

export const transactionIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.debug("Execute URL transaction id validation middleware checks");

  const transactionId: string = req.params[urlParams.PARAM_TRANSACTION_ID];

  logger.debug("Check transaction id");
  if (!isUrlIdValid(transactionId)) {
    urlUtils.sanitiseReqlUrls(req);
    logger.infoRequest(req, `No Valid Transaction Id in URL: ${req.originalUrl}`);
    return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  }

  return next();
};
