import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { formatForDisplay, getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createConfirmationStatement } from "../services/confirmation.statement.service";
import { Session } from "@companieshouse/node-session-handler";
import { FEATURE_FLAG_PRIVATE_SDK_12052021 } from "../utils/properties";
import { isActiveFeature } from "../utils/feature.flag";
import { checkEligibility } from "../services/eligibility.service";
import {
  EligibilityStatusCode
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { isInFuture, toReadableFormat } from "../utils/date";
import { DateTime } from "luxon";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyProfile: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);
    return res.render(Templates.CONFIRM_COMPANY, buildPageOptions(companyProfile));
  } catch (e) {
    return next(e);
  }
};

const buildPageOptions = (companyProfile: CompanyProfile): Object => {
  // need to extract the nextMadeUpTo before company profile is formatted for display as it will modify the date format
  const nextMadeUpTo = companyProfile?.confirmationStatement?.nextMadeUpTo;

  const pageOptions = {
    company: formatForDisplay(companyProfile),
    templateName: Templates.CONFIRM_COMPANY
  };

  if (!isFilingDue(nextMadeUpTo)) {
    pageOptions["notDueWarning"] = {
      todaysDate: toReadableFormat(DateTime.now().toISODate())
    };
  }
  return pageOptions;
};

const isFilingDue = (nextMadeUpTo: string | undefined): boolean => {
  let due = true;
  if (nextMadeUpTo) {
    if (isInFuture(nextMadeUpTo)) {
      due = false;
    }
  }
  return due;
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
    const nextPageUrl = TRADING_STATUS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
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
  [EligibilityStatusCode.INVALID_COMPANY_TYPE_PAPER_FILING_ONLY]: Templates.USE_PAPER
};
