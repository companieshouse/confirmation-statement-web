import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {
    GCI_RETURN_URL_SESSION_KEY,
    LIMITED_PARTNERSHIP_COMPANY_TYPE,
    LIMITED_PARTNERSHIP_SUBTYPES,
} from "./constants";
import {
    CONFIRMATION_PATH,
    LP_CHECK_YOUR_ANSWER_PATH,
    LP_CONFIRMATION_PATH,
    LP_CS_DATE_PATH,
    LP_REVIEW_PATH,
    LP_SIC_CODE_SUMMARY_PATH,
    REVIEW_PATH,
} from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { getAcspSessionData } from "./session.acsp";

export interface CsDateValue {
    csDateYear: string;
    csDateMonth: string;
    csDateDay: string;
}

export function isLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
    return (
        companyProfile?.type === LIMITED_PARTNERSHIP_COMPANY_TYPE &&
        !!companyProfile.subtype &&
        Object.values(LIMITED_PARTNERSHIP_SUBTYPES).includes(companyProfile.subtype)
    );
}

export function isStandardLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
    return (
        isLimitedPartnershipCompanyType(companyProfile) && companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.LP
    );
}

export function isSlpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
    return (
        isLimitedPartnershipCompanyType(companyProfile) && companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.SLP
    );
}

export function isPflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
    return (
        isLimitedPartnershipCompanyType(companyProfile) && companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.PFLP
    );
}

export function isSpflpLimitedPartnershipCompanyType(companyProfile: CompanyProfile): boolean {
    return (
        isLimitedPartnershipCompanyType(companyProfile) && companyProfile.subtype === LIMITED_PARTNERSHIP_SUBTYPES.SPFLP
    );
}

export function getReviewPath(isAcspJourneyOrPath: boolean | string): string {
    const isAcspJourney =
        typeof isAcspJourneyOrPath === "boolean" ? isAcspJourneyOrPath : isACSPJourney(isAcspJourneyOrPath);
    return isAcspJourney ? LP_REVIEW_PATH : REVIEW_PATH;
}

export function getConfirmationPath(isAcspJourneyOrPath: boolean | string): string {
    const isAcspJourney =
        typeof isAcspJourneyOrPath === "boolean" ? isAcspJourneyOrPath : isACSPJourney(isAcspJourneyOrPath);
    return isAcspJourney ? LP_CONFIRMATION_PATH : CONFIRMATION_PATH;
}

export function isAcspReviewPath(path: string): boolean {
    return isACSPJourney(path) && path.toLowerCase().includes("review");
}

export function isAcspConfirmationPath(path: string): boolean {
    return isACSPJourney(path) && path.toLowerCase().includes("confirmation");
}

export function isACSPJourney(path: string): boolean {
    if (!path) {
        return false;
    }
    // Remove query string, normalise to lowercase
    const cleaned = path.split("?")[0].toLowerCase();
    const segments = cleaned.split("/").filter(Boolean);
    return segments.includes("acsp");
}

export function getACSPBackPath(session: Session, company: CompanyProfile): string {
    const sessionData = getAcspSessionData(session);
    const isPrivateFundLimitedPartnership =
        isPflpLimitedPartnershipCompanyType(company) || isSpflpLimitedPartnershipCompanyType(company);

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

export function isIntegratedJourney(session: Session | undefined): boolean {
    return undefined !== session?.getExtraData(GCI_RETURN_URL_SESSION_KEY);
}
