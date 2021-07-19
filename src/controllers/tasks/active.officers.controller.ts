import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { FEATURE_FLAG_ACTIVE_OFFICERS_01072021 } from "../../utils/properties";
import { isActiveFeature } from "../../utils/feature.flag";
import { validDummyCompanyOfficers } from "../../utils/dummy.company.officers";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { getCompanyOfficers } from "../../services/company.officers.service";
import { OFFICER_DETAILS_ERROR, RADIO_BUTTON_VALUE } from "../../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
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

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOfficerButtonValue = req.body.activeDirectors;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];

    if (activeOfficerButtonValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber));
    } else {
      return res.render(Templates.ACTIVE_OFFICERS, {
        backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
        officerErrorMsg: OFFICER_DETAILS_ERROR,
        templateName: Templates.ACTIVE_OFFICERS
      });
    }
  } catch (e) {
    return next(e);
  }
};
