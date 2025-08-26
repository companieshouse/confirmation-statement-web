import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {
  LIMITED_PARTNERSHIP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SUBTYPES
} from "./constants";
import { CONFIRMATION_PATH, LP_CHECK_YOUR_ANSWER_PATH, LP_CONFIRMATION_PATH, LP_CS_DATE_PATH, LP_REVIEW_PATH, LP_SIC_CODE_SUMMARY_PATH, REVIEW_PATH } from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { isLimitedPartnershipFeatureEnabled, isScottishLimitedPartnershipFeatureEnabled, isPrivateFundLimitedPartnershipFeatureEnabled, isScottishPrivateFundimitedPartnershipFeatureEnabled } from "./feature.flag";
import { getAcspSessionData } from "./session.acsp";

export function isLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {

  return companyProfile?.type === LIMITED_PARTNERSHIP_COMPANY_TYPE &&
    !!companyProfile.subtype &&
    Object.values(LIMITED_PARTNERSHIP_SUBTYPES).includes(companyProfile.subtype);

}


export function isStandardLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnershipCompanyType(companyProfile) &&
    companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.LP;
}

export function isSlpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnershipCompanyType(companyProfile) &&
    companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.SLP;
}


export function isPflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnershipCompanyType(companyProfile) &&
    companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.PFLP;
}


export function isSpflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
  return isLimitedPartnershipCompanyType(companyProfile) &&
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

export function getACSPBackPath(session: Session, company: CompanyProfile): string {
  const sessionData = getAcspSessionData(session);
  const isPrivateFundLimitedPartnership =
    isPflpLimitedPartnershipCompanyType(company) ||
    isSpflpLimitedPartnershipCompanyType(company);

  if (isPrivateFundLimitedPartnership) {
    if (sessionData && sessionData.changeConfirmationStatementDate !== null) {
      if (sessionData.changeConfirmationStatementDate) {
        return LP_CHECK_YOUR_ANSWER_PATH;
      }

      return LP_CS_DATE_PATH;
    }
  }

  return LP_SIC_CODE_SUMMARY_PATH;
}

export function isLimitedPartnershipSubtypeFeatureFlagEnabled(companyProfile: CompanyProfile): boolean {
  if (isLimitedPartnershipCompanyType(companyProfile)) {
    switch (companyProfile.subtype) {
        case LIMITED_PARTNERSHIP_SUBTYPES.LP:
          return isLimitedPartnershipFeatureEnabled();
        case LIMITED_PARTNERSHIP_SUBTYPES.SLP:
          return isScottishLimitedPartnershipFeatureEnabled();
        case LIMITED_PARTNERSHIP_SUBTYPES.PFLP:
          return isPrivateFundLimitedPartnershipFeatureEnabled();
        case LIMITED_PARTNERSHIP_SUBTYPES.SPFLP:
          return isScottishPrivateFundimitedPartnershipFeatureEnabled();
    }
  }
  return false;
}
