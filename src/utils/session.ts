import { Request } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { COMPANY_PROFILE_SESSION_KEY, LIMITED_PARTNERSHIP_COMPANY_TYPE } from "../utils/constants";


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

export function isLimitedPartnershipCompanyType(req: Request) {
  const companyProfile = getCompanyProfileFromSession(req);

  return (companyProfile &&
    companyProfile.type &&
    companyProfile.type === LIMITED_PARTNERSHIP_COMPANY_TYPE);
}
