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

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyProfile: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);
    return res.render(Templates.CONFIRM_COMPANY, getPageOptions(companyProfile));
  } catch (e) {
    return next(e);
  }
};

const getPageOptions = (companyProfile: CompanyProfile): Object => {
  const pageOptions = {
    company: formatForDisplay(companyProfile),
    templateName: Templates.CONFIRM_COMPANY
  };

  const nextMadeUpTo = companyProfile?.confirmationStatement?.nextMadeUpTo;
  if (nextMadeUpTo) {
    if (isInFuture(nextMadeUpTo)) {
      const todayISOString = new Date().toISOString();
      pageOptions["notDueWarning"] = {
        todaysDate: toReadableFormat(todayISOString)
      };
    }
  }
  return pageOptions;
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const eligibilityStatusCode: EligibilityStatusCode = await checkEligibility(session, companyNumber);
    if (eligibilityStatusCode === EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE) {
      await createNewConfirmationStatement(req);
      const url = TRADING_STATUS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
      return res.redirect(url);
    } else {
      return displayEligibilityStopPage(res, eligibilityStatusCode);
    }
  } catch (e) {
    return next(e);
  }
};

const displayEligibilityStopPage = (res: Response, eligibilityStatusCode: EligibilityStatusCode) => {
  const stopPage: string = stopPages[eligibilityStatusCode];
  if (!stopPage) {
    throw new Error(`Unknown eligibilityStatusCode ${eligibilityStatusCode}`);
  }
  return res.render(stopPage);
};

const createNewConfirmationStatement = async (req: Request) => {
  if (isActiveFeature(FEATURE_FLAG_PRIVATE_SDK_12052021)) {
    const transactionId: string = "";
    const session: Session = req.session as Session;
    await createConfirmationStatement(session, transactionId);
  }
};

const stopPages = {
  [EligibilityStatusCode.INVALID_COMPANY_STATUS]: Templates.INVALID_COMPANY_STATUS,
  [EligibilityStatusCode.INVALID_COMPANY_TYPE_USE_WEB_FILING]: Templates.USE_WEBFILING
};
