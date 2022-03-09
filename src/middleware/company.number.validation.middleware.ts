import { NextFunction, Request, Response } from "express";
import { URL_QUERY_PARAM } from "../types/page.urls";
import { isCompanyNumberValid } from "../validators/company.number.validator";
import { logger } from "../utils/logger";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const companyNumberQueryParameterValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const companyNumber: string = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;

  if (!companyNumber) {
    return next();
  }

  if (!isCompanyNumberValid(companyNumber)) {
    urlUtils.sanitiseReqUrls(req);
    logger.infoRequest(req, "No Valid Company Number query parameter supplied: " + req.originalUrl);
    return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  }

  return next();
};
