import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createConfirmationStatement } from "../services/confirmation.statement.service";
import { Session } from "@companieshouse/node-session-handler";
import { FEATURE_FLAG_PRIVATE_SDK_12052021 } from "../utils/properties";
import { isActiveFeature } from "../utils/feature.flag";
import { checkEligibility } from "../services/eligibility.service";
import {
  EligibilityStatusCode
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { TRADING_STATUS_PATH } from "../types/page.urls";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);
    return res.render(Templates.CONFIRM_COMPANY, { company, templateName: Templates.CONFIRM_COMPANY });
  } catch (e) {
    next(e);
  }
};

export const post = async (req: Request, res: Response) => {
  const session: Session = req.session as Session;
  const companyNumber = req.query["companyNumber"] as string;
  const eligibilityStatusCode: EligibilityStatusCode = await checkEligibility(session, companyNumber);
  if (eligibilityStatusCode === EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE) {
    await createNewConfirmationStatement(req);
    const url = TRADING_STATUS_PATH.replace(":companyNumber", companyNumber);
    return res.redirect(url);
  } else {
    return displayEligibilityStopPage(res, eligibilityStatusCode );
  }
};

const displayEligibilityStopPage = (res: Response, eligibilityStatusCode: EligibilityStatusCode) => {
  if (eligibilityStatusCode === EligibilityStatusCode.INVALID_COMPANY_STATUS) {
    return res.render(Templates.INVALID_COMPANY_STATUS);
  }
};

const createNewConfirmationStatement = async (req: Request) => {
  if (isActiveFeature(FEATURE_FLAG_PRIVATE_SDK_12052021)) {
    const transactionId: string = "";
    const session: Session = req.session as Session;
    await createConfirmationStatement(session, transactionId);
  }
};
