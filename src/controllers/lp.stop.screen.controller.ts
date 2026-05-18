import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { Templates } from "../types/template.paths";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionCompany = getCompanyProfileFromSession(req);
    if (!sessionCompany || !sessionCompany.companyNumber) {
      return next(new Error(`Invalid company number for LP stop screen`));
    }
    const company: CompanyProfile = sessionCompany;
    const companyNumber = company.companyNumber;
    return res.render(Templates.LP_STOP_SCREEN, {
      company,
      templateName: Templates.LP_STOP_SCREEN,
      companyNumber
    });
  } catch (e) {
    return next(e);
  }
};
