import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { URL_QUERY_PARAM, USE_PAPER_PATH } from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { isCompanyNumberValid } from "../validators/company.number.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;
    if (!isCompanyNumberValid(companyNumber)) {
      return next(new Error(`Invalid company number entered in ${USE_PAPER_PATH} url query parameter`));
    }
    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    return res.render(Templates.USE_PAPER, {
      company,
      templateName: Templates.USE_PAPER
    });
  } catch (e) {
    return next(e);
  }
};
