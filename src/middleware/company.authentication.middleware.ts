import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { logger } from "../utils/logger";
import { isCompanyNumberValid } from "../validators/company.number.validator";

export const companyAuthenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const companyNumber: string = req.params.companyNumber;

  if (!isCompanyNumberValid(companyNumber)) {
    logger.errorRequest(req, "No Valid Company Number in URL: " + req.originalUrl);
    return next(new Error("No Valid Company Number in Request"));
  }

  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: req.originalUrl,
    companyNumber: companyNumber
  };

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};
