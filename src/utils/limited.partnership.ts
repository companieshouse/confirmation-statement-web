import { Request } from "express";
import { getCompanyProfileFromSession } from "./session";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_LP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_PFLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SPFLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_COMPANY_TYPES } from "./constants";

export function isLimitedPartnershipCompanyType(req: Request): boolean {
  const companyProfile = getCompanyProfileFromSession(req);

  return (companyProfile !== undefined
    && typeof companyProfile.type === "string"
    && LIMITED_PARTNERSHIP_COMPANY_TYPES.includes(companyProfile.type));
}

export function isStandardLimitedPartnershipCompanyType(req: Request): boolean {
  const companyType = getCompanyProfileFromSession(req).type;

  return (isLimitedPartnershipCompanyType(req)
    && (companyType === LIMITED_PARTNERSHIP_COMPANY_TYPE || companyType === LIMITED_PARTNERSHIP_LP_COMPANY_TYPE));
}

export function isSlpLimitedPartnershipCompanyType(req: Request): boolean {
  return (isLimitedPartnershipCompanyType(req)
    && getCompanyProfileFromSession(req).type === LIMITED_PARTNERSHIP_SLP_COMPANY_TYPE);
}

export function isPflpLimitedPartnershipCompanyType(req: Request): boolean {
  return (isLimitedPartnershipCompanyType(req)
    && getCompanyProfileFromSession(req).type === LIMITED_PARTNERSHIP_PFLP_COMPANY_TYPE);
}

export function isSpflpLimitedPartnershipCompanyType(req: Request): boolean {
  return (isLimitedPartnershipCompanyType(req)
    && getCompanyProfileFromSession(req).type === LIMITED_PARTNERSHIP_SPFLP_COMPANY_TYPE);
}
