import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE, LIMITED_PARTNERSHIP_SUBTYPES } from "./constants";

import { CONFIRMATION_PATH, LP_CONFIRMATION_PATH, LP_REVIEW_PATH, REVIEW_PATH } from "../types/page.urls";


export function isLimitedPartnership(companyProfile: CompanyProfile): boolean {
  return companyProfile?.type === "limited-partnership" &&
         !!companyProfile.subtype &&
         Object.values(LIMITED_PARTNERSHIP_SUBTYPES).includes(companyProfile.subtype);
}


export function isStandardLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnership(companyProfile) &&
         companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.LP;
}

export function isSlpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnership(companyProfile) &&
         companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.SLP;
}


export function isPflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnership(companyProfile) &&
         companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.PFLP;
}


export function isSpflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnership(companyProfile) &&
         companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.SPFLP;
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
