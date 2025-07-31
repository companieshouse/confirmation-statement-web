import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_LP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_PFLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SPFLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_COMPANY_TYPES } from "./constants";

export function isLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return (companyProfile !== undefined
    && LIMITED_PARTNERSHIP_COMPANY_TYPES.includes(companyProfile.type));
}

export function isStandardLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return (isLimitedPartnershipCompanyType(companyProfile)
    && (companyProfile.type === LIMITED_PARTNERSHIP_COMPANY_TYPE || companyProfile.type === LIMITED_PARTNERSHIP_LP_COMPANY_TYPE));
}

export function isSlpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return (isLimitedPartnershipCompanyType(companyProfile)
    && companyProfile.type === LIMITED_PARTNERSHIP_SLP_COMPANY_TYPE);
}

export function isPflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return (isLimitedPartnershipCompanyType(companyProfile)
    && companyProfile.type === LIMITED_PARTNERSHIP_PFLP_COMPANY_TYPE);
}

export function isSpflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return (isLimitedPartnershipCompanyType(companyProfile)
    && companyProfile.type === LIMITED_PARTNERSHIP_SPFLP_COMPANY_TYPE);
}
