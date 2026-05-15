import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { URL_QUERY_PARAM, LP_STOP_SCREEN } from "../types/page.urls";
import { isCompanyNumberValid } from "../validators/company.number.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;

    if (!isCompanyNumberValid(companyNumber)) {
      return next(new Error(`Invalid company number entered in ${LP_STOP_SCREEN} url query parameter`));
    }

    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    return res.render("limited-partners/components/stop-screen/lp-invalid-company-status.html", {
      company,
      templateName: "limited-partners/components/stop-screen/lp-invalid-company-status.html"
    });
  } catch (e) {
    return next(e);
  }
};
