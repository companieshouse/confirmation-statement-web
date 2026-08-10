import { Request } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { COMPANY_PROFILE_SESSION_KEY } from "../utils/constants";
import { logger } from "../utils/logger";

export function getSignInInfo(session: any): ISignInInfo {
    return session?.data?.[SessionKey.SignInInfo];
}

export function getLoggedInAcspNumber(session: any): string {
    const signInInfo = getSignInInfo(session);
    return signInInfo?.[SignInInfoKeys.AcspNumber] as string;
}

export function getCompanyProfileFromSession(req: Request): CompanyProfile {
    return req.session?.getExtraData(COMPANY_PROFILE_SESSION_KEY) as CompanyProfile;
}

export function logCSRFToken(req: Request, message: string): void {
    // only if the request is MUTABLE
    const MUTABLE_METHODS = ["POST", "DELETE", "PUT", "PATCH"];

    if (MUTABLE_METHODS.includes(req.method)) {
        logger.info(
            message +
                ", url [" +
                req.url +
                "], Session csrf token: " +
                req?.session?.data[SessionKey.CsrfToken] +
                ", Request CSRF Token: " +
                req?.body?.["_csrf"]
        );
    }
}
