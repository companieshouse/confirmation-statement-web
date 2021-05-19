import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { logger } from "../utils/logger";

const COMPANY_NUMBER_MATCHER = new RegExp("\\/company\\/([0-9a-zA-Z]{8})\\/");

export const companyAuthenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  console.log("************* " + JSON.stringify(req.params));

  const companyNumber: string | undefined = extractCompanyNumberFromRequest(req);

  if (!companyNumber) {
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

const extractCompanyNumberFromRequest = (req: Request): string | undefined => {
  const originalPath: string = req.originalUrl;
  const pathMatches = originalPath.match(COMPANY_NUMBER_MATCHER);

  if (pathMatches) {
    return pathMatches[1];
  }

  return undefined;
};
