import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { logger } from "../utils/logger";
import { isCompanyNumberValid } from "../validators/company.number.validator";
import { urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Templates } from "../types/template.paths";
import { isLimitedPartnershipCompanyType } from "../utils/limited.partnership";
import { isAuthorisedAgent } from "@companieshouse/ch-node-utils";
import * as urls from "../types/page.urls";
import { getCompanyProfileFromSession } from "../utils/session";


export const companyAuthenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const companyNumber: string = req.params[urlParams.PARAM_COMPANY_NUMBER];

  if (!isCompanyNumberValid(companyNumber)) {
    urlUtils.sanitiseReqUrls(req);
    logger.errorRequest(req, "No Valid Company Number in URL: " + req.originalUrl);
    return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  }

  if (isLimitedPartnershipCompanyType(getCompanyProfileFromSession(req))) {
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
      return res.redirect(urls.LP_MUST_BE_AUTHORISED_AGENT_PATH);
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
