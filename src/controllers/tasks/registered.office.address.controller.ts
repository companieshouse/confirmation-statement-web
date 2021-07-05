import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, REGISTERED_OFFICE_ADDRESS_PATH, CHANGE_ROA_PATH, urlParams } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { RADIO_BUTTON_VALUE, REGISTERED_OFFICE_ADDRESS_ERROR } from "../../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
    return res.render(Templates.REGISTERED_OFFICE_ADDRESS, {
      templateName: Templates.REGISTERED_OFFICE_ADDRESS,
      backLinkUrl,
      registeredOfficeAddress: companyProfile.registeredOfficeAddress
    });
  } catch (error) {
    return next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const roaButtonValue = req.body.registeredOfficeAddress;
    const companyNumber = getCompanyNumber(req);

    if (roaButtonValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber));
    }

    if (roaButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_RO, {
        backLinkUrl: urlUtils.getUrlWithCompanyNumber(REGISTERED_OFFICE_ADDRESS_PATH, companyNumber),
        taskListUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
        changeRoaUrl: urlUtils.getUrlWithCompanyNumber(CHANGE_ROA_PATH, companyNumber)
      });
    }

    return res.render(Templates.REGISTERED_OFFICE_ADDRESS, {
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
      roaErrorMsg: REGISTERED_OFFICE_ADDRESS_ERROR,
      templateName: Templates.REGISTERED_OFFICE_ADDRESS
    });
  } catch (e) {
    return next(e);
  }
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
