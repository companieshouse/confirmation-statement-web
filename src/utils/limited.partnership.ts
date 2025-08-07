import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_LP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_PFLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SPFLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_COMPANY_TYPES } from "./constants";
import { CONFIRMATION_PATH, LP_CONFIRMATION_PATH, LP_REVIEW_PATH, REVIEW_PATH } from "../types/page.urls";

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

export function getReviewPath(isAcspJourney: boolean): string {
  return isAcspJourney ? LP_REVIEW_PATH : REVIEW_PATH;
}

export function getConfirmationPath(isAcspJourney: boolean): string {
  return isAcspJourney ? LP_CONFIRMATION_PATH : CONFIRMATION_PATH;
}

export function isACSPJourney(path: string): boolean {
  return path.toLowerCase().includes("acsp");
}
