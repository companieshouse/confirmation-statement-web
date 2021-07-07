import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { ACTIVE_OFFICERS_PATH, TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { FEATURE_FLAG_ACTIVE_OFFICERS_01072021 } from "../../utils/properties";
import { isActiveFeature } from "../../utils/feature.flag";
import { validDummyCompanyOfficers } from "../../utils/dummy.company.officers";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { getCompanyOfficers } from "../../services/company.officers.service";
import { RADIO_BUTTON_VALUE } from "../../utils/constants";

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
    let companyOfficers: CompanyOfficers;
    if (isActiveFeature(FEATURE_FLAG_ACTIVE_OFFICERS_01072021)){
      companyOfficers = await getCompanyOfficers(companyNumber);
    } else {
      companyOfficers = validDummyCompanyOfficers;
    }
    return res.render(Templates.ACTIVE_OFFICERS, { backLinkUrl, companyOfficers });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response) => {
  const activeDirectorsButtonValue = req.body.activeDirectors;
  const companyNumber = getCompanyNumber(req);

  if (activeDirectorsButtonValue === RADIO_BUTTON_VALUE.NO) {
    return res.render(Templates.WRONG_OFFICERS, {
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(ACTIVE_OFFICERS_PATH, companyNumber),
      templateName: Templates.WRONG_OFFICERS,
    });
  }
}
