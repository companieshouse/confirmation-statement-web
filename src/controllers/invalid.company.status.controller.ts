import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { Templates } from "../types/template.paths";
import { URL_QUERY_PARAM } from "../types/page.urls";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.query[URL_QUERY_PARAM.COMPANY_NUMBER];
    const company: CompanyProfile = await getCompanyProfile(companyNumber as string);
    return res.render(Templates.INVALID_COMPANY_STATUS, {
      company,
      templateName: Templates.INVALID_COMPANY_STATUS
    });
  } catch (e) {
    return next(e);
  }
};
