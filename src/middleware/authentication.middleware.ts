import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    
    const authMiddlewareConfig: AuthOptions = {
        accountWebUrl: "",
        returnUrl: req.originalUrl
    };

    return authMiddleware(authMiddlewareConfig)(req, res, next);
};