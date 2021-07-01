import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { getCompanyOfficers } from "../../services/company.officers.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
    const companyOfficers: CompanyOfficers = await getCompanyOfficers(companyNumber);
    return res.render(Templates.ACTIVE_OFFICERS, { backLinkUrl, companyOfficers });
  } catch (e) {
    return next(e);
  }
};
