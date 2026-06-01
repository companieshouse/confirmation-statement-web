import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { Templates } from "../types/template.paths";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionCompany = getCompanyProfileFromSession(req);
    const companyNumber = sessionCompany?.companyNumber;
    if (!companyNumber) {
      return next(new Error(`Invalid company number for LP transitional stop screen`));
    }
    const company: CompanyProfile = sessionCompany;
    return res.render(Templates.LP_TRANSITIONAL_STOP_SCREEN, {
      company,
      templateName: Templates.LP_TRANSITIONAL_STOP_SCREEN,
      companyNumber
    });
  } catch (e) {
    return next(e);
  }
};
