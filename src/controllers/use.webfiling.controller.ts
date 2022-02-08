import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { Templates } from "../types/template.paths";
import { URL_QUERY_PARAM, USE_WEBFILING_PATH } from "../types/page.urls";
import { isCompanyNumberValid } from "../validators/company.number.validator";
import { FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 } from "../utils/properties";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;

    if (!isCompanyNumberValid(companyNumber)) {
      return next(new Error(`Invalid company number entered in ${USE_WEBFILING_PATH} url query parameter`));
    }

    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    return res.render(Templates.USE_WEBFILING, {
      company,
      FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021,
      templateName: Templates.USE_WEBFILING
    });
  } catch (e) {
    return next(e);
  }
};
