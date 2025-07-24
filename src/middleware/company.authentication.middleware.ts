import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { logger } from "../utils/logger";
import { isCompanyNumberValid } from "../validators/company.number.validator";
import { urlParams, USE_WEBFILING_PATH, URL_QUERY_PARAM } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Templates } from "../types/template.paths";
import { isLimitedPartnershipCompanyType } from "../utils/session";
import { isAuthorisedAgent } from "@companieshouse/ch-node-utils";

export const companyAuthenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const companyNumber: string = req.params[urlParams.PARAM_COMPANY_NUMBER];

  if (!isCompanyNumberValid(companyNumber)) {
    urlUtils.sanitiseReqUrls(req);
    logger.errorRequest(req, "No Valid Company Number in URL: " + req.originalUrl);
    return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  }

  if (isLimitedPartnershipCompanyType(req)) {
    if (isAuthorisedAgent(req.session)) {
      /* TODO: ACSP authentication does not support to create transaction at this moment.
      Once this feature become available, the following logic could be reused */
      //   const acspNumber: string = getLoggedInAcspNumber(req.session);
      //   const authMiddlewareConfig: AuthOptions = {
      //   chsWebUrl: CHS_URL,
      //   returnUrl: req.originalUrl,
      //   acspNumber: acspNumber
      // };
      //
      // return acspManageUsersAuthMiddleware(authMiddlewareConfig)(req, res, next);

      // TODO: the follow authMiddlewareConfig need to be updated/removed once ACSP authentication (above)feature is available
      const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: CHS_URL,
        returnUrl: req.originalUrl,
        companyNumber: companyNumber
      };

      return authMiddleware(authMiddlewareConfig)(req, res, next);

    } else {
      // TODO: the following logic need to be updated to redirect to stop screen (Ticket CSE-745)
      res.redirect(urlUtils.setQueryParam(USE_WEBFILING_PATH, URL_QUERY_PARAM.COMPANY_NUM, companyNumber));
    }

  } else {

    const authMiddlewareConfig: AuthOptions = {
      chsWebUrl: CHS_URL,
      returnUrl: req.originalUrl,
      companyNumber: companyNumber
    };
    return authMiddleware(authMiddlewareConfig)(req, res, next);
  }
};
