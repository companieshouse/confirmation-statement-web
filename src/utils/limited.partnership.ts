import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SUBTYPES,
  LP_CONFIRMATION_STATEMENT_ERROR,
  LP_LAWFUL_ACTIVITY_STATEMENT_ERROR} from "./constants";
import { CONFIRMATION_PATH, LP_CHECK_YOUR_ANSWER_PATH, LP_CONFIRMATION_PATH, LP_CS_DATE_PATH, LP_REVIEW_PATH, LP_SIC_CODE_SUMMARY_PATH, REVIEW_PATH } from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { isLimitedPartnershipFeatureEnabled, isScottishLimitedPartnershipFeatureEnabled, isPrivateFundLimitedPartnershipFeatureEnabled, isScottishPrivateFundLimitedPartnershipFeatureEnabled } from "./feature.flag";
import { getAcspSessionData } from "./session.acsp";
import { selectLang, getLocalesService } from "./localise";
import { urlUtils } from "./url";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { isStatementCheckboxTicked } from "./check.box.ticked";

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
          return isScottishPrivateFundLimitedPartnershipFeatureEnabled();
    }
  }
  return false;
}

export function handleLimitedPartnershipConfirmationJourney (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, companyNumber: string, companyProfile: CompanyProfile, transactionId: string, submissionId: string, session: Session) {

  const confirmationCheckboxValue = req.body.confirmationStatement;
  const lawfulActivityCheckboxValue = req.body.lawfulActivityStatement;

  const confirmationValid = isStatementCheckboxTicked(
    confirmationCheckboxValue
  );

  const lawfulActivityValid = isStatementCheckboxTicked(
    lawfulActivityCheckboxValue
  );

  const ecctEnabled = true;

  let confirmationStatementError: string = "";
  if (!confirmationValid) {
    confirmationStatementError = LP_CONFIRMATION_STATEMENT_ERROR;
  }

  let lawfulActivityStatementError: string = "";
  if (!lawfulActivityValid) {
    lawfulActivityStatementError = LP_LAWFUL_ACTIVITY_STATEMENT_ERROR;
  }

  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const backLinkPath = getACSPBackPath(session, companyProfile);
  const previousPage = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
    backLinkPath,
    companyNumber,
    transactionId,
    submissionId
  );

  if (!confirmationValid || !lawfulActivityValid) {
    return {
      renderData: {
        lang,
        locales,
        previousPage,
        confirmationStatementError,
        lawfulActivityStatementError,
        confirmationChecked: confirmationCheckboxValue === "true",
        lawfulActivityChecked: lawfulActivityCheckboxValue === "true",
        ecctEnabled
      }
    };
  }

  const isAcspJourney = isACSPJourney(req.originalUrl);
  const nextPage = getConfirmationPath(isAcspJourney);

  return { nextPage };
}
