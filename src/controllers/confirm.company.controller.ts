import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { formatForDisplay, getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createConfirmationStatement, getNextMadeUpToDate } from "../services/confirmation.statement.service";
import { Session } from "@companieshouse/node-session-handler";
import { FEATURE_FLAG_PRIVATE_SDK_12052021 } from "../utils/properties";
import { isActiveFeature } from "../utils/feature.flag";
import { checkEligibility } from "../services/eligibility.service";
import {
  EligibilityStatusCode, NextMadeUpToDate
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { CREATE_TRANSACTION_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { toReadableFormat } from "../utils/date";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyProfile: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);
    return res.render(Templates.CONFIRM_COMPANY, await buildPageOptions(req.session as Session, companyProfile));
  } catch (e) {
    return next(e);
  }
};

const buildPageOptions = async (session: Session, companyProfile: CompanyProfile): Promise<Object> => {
  const pageOptions = {
    company: formatForDisplay(companyProfile),
    templateName: Templates.CONFIRM_COMPANY
  };

  if (companyProfile?.confirmationStatement?.nextMadeUpTo) {
    const nextMadeUpToDate: NextMadeUpToDate = await getNextMadeUpToDate(session, companyProfile.companyNumber);

    // can't use falsy here, isDue can be undefined
    if (nextMadeUpToDate.isDue === false) {
      pageOptions["notDueWarning"] = {
        newNextMadeUptoDate: nextMadeUpToDate.newNextMadeUpToDate ? toReadableFormat(nextMadeUpToDate.newNextMadeUpToDate) : ""
      };
    }
  }
  return pageOptions;
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const company: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);
    const eligibilityStatusCode: EligibilityStatusCode = await checkEligibility(session, companyNumber);

    if (!isCompanyValidForService(eligibilityStatusCode)) {
      return displayEligibilityStopPage(res, eligibilityStatusCode, company);
    }

    await createNewConfirmationStatement(session);
    const nextPageUrl = urlUtils.getUrlWithCompanyNumber(CREATE_TRANSACTION_PATH, companyNumber);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

const isCompanyValidForService = (eligibilityStatusCode: EligibilityStatusCode): boolean =>
  eligibilityStatusCode === EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE;

const displayEligibilityStopPage = (res: Response, eligibilityStatusCode: EligibilityStatusCode, company: CompanyProfile) => {
  const stopPage: string = stopPages[eligibilityStatusCode];
  if (!stopPage) {
    throw new Error(`Unknown eligibilityStatusCode ${eligibilityStatusCode}`);
  }
  return res.render(stopPage, { company, templateName: stopPage });
};

const createNewConfirmationStatement = async (session: Session) => {
  if (isActiveFeature(FEATURE_FLAG_PRIVATE_SDK_12052021)) {
    const transactionId: string = "";
    await createConfirmationStatement(session, transactionId);
  }
};

const stopPages = {
  [EligibilityStatusCode.INVALID_COMPANY_STATUS]: Templates.INVALID_COMPANY_STATUS,
  [EligibilityStatusCode.INVALID_COMPANY_TRADED_STATUS_USE_WEBFILING]: Templates.USE_WEBFILING,
  [EligibilityStatusCode.INVALID_COMPANY_TYPE_USE_WEB_FILING]: Templates.USE_WEBFILING,
  [EligibilityStatusCode.INVALID_COMPANY_APPOINTMENTS_INVALID_NUMBER_OF_OFFICERS]: Templates.USE_WEBFILING,
  [EligibilityStatusCode.INVALID_COMPANY_APPOINTMENTS_MORE_THAN_ONE_PSC]: Templates.USE_WEBFILING,
  [EligibilityStatusCode.INVALID_COMPANY_APPOINTMENTS_MORE_THAN_ONE_SHAREHOLDER]: Templates.USE_WEBFILING,
  [EligibilityStatusCode.INVALID_COMPANY_TYPE_PAPER_FILING_ONLY]: Templates.USE_PAPER,
  [EligibilityStatusCode.INVALID_COMPANY_TYPE_CS01_FILING_NOT_REQUIRED]: Templates.NO_FILING_REQUIRED
};
