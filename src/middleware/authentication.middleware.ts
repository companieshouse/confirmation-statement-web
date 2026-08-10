import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { ACCESSIBILITY_STATEMENT, CONFIRMATION_STATEMENT } from "../types/page.urls";
import { CHS_URL } from "../utils/properties";
import { logCSRFToken } from "../utils/session";

const USER_AUTH_WHITELISTED_URLS: string[] = [
    CONFIRMATION_STATEMENT + ACCESSIBILITY_STATEMENT,
    `${CONFIRMATION_STATEMENT + ACCESSIBILITY_STATEMENT}/`,
];

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (isWhitelistedUrl(req.originalUrl)) {
        return next();
    }

    const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: CHS_URL,
        returnUrl: req.originalUrl,
    };
    logCSRFToken(req, "authenticationMiddleware");
    return authMiddleware(authMiddlewareConfig)(req, res, next);
};

const isWhitelistedUrl = (url: string): boolean => USER_AUTH_WHITELISTED_URLS.includes(url);
