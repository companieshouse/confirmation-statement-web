import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { LP_MUST_BE_AUTHORISED_AGENT_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { isLimitedPartnershipCompanyType } from "../utils/limited.partnership";
import { isAuthorisedAgent } from "@companieshouse/ch-node-utils";
import { getCompanyProfileFromSession, getLoggedInAcspNumber } from "../utils/session";
import { CHS_URL } from "../utils/properties";
import { acspManageUsersAuthMiddleware, AuthOptions } from "@companieshouse/web-security-node";

export const acspAuthenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Execute ACSP URL validation middleware checks");

    if (!isAuthorisedAgent(req.session)) {
        logger.errorRequest(req, "User is not a valid ACSP member");
        return res.redirect(LP_MUST_BE_AUTHORISED_AGENT_PATH);
    } else if (!isLimitedPartnershipCompanyType(getCompanyProfileFromSession(req))) {
        logger.errorRequest(req, "Company type is not valid");
        return res
            .status(400)
            .render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
    } else {
        const acspNumber: string = getLoggedInAcspNumber(req.session);
        const authMiddlewareConfig: AuthOptions = {
            chsWebUrl: CHS_URL,
            returnUrl: req.originalUrl,
            acspNumber: acspNumber,
        };
        return acspManageUsersAuthMiddleware(authMiddlewareConfig)(req, res, next);
    }
};
