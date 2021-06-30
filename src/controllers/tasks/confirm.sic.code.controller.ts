import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, urlParams, SIC_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { lookupSicCodeDescription } from "../../utils/api.enumerations";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { SicCode } from "../../types/sic.code";
import { RADIO_BUTTON_VALUE, SIC_CODE_ERROR } from "../../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const sicCodes: SicCode[] = getSicCodeDetails(companyProfile);
    return res.render(Templates.SIC, { backLinkUrl, sicCodes });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const sicButtonValue = req.body.sicCodeStatus;
  const companyNumber = getCompanyNumber(req);

  if (sicButtonValue === RADIO_BUTTON_VALUE.YES) {
    return res.redirect(urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber));
  }

  if (sicButtonValue === RADIO_BUTTON_VALUE.NO) {
    return res.render(Templates.WRONG_SIC, {
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(SIC_PATH, companyNumber),
      templateName: Templates.SIC
    });
  }

  try {
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    return res.render(Templates.SIC, {
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
      sicCodes: getSicCodeDetails(companyProfile),
      sicCodeErrorMsg: SIC_CODE_ERROR,
      templateName: Templates.SIC
    });
  } catch (e) {
    return next(e);
  }
};

function getSicCodeDetails (companyProfile: CompanyProfile): SicCode[] {
  const sicCodeList: SicCode[] = [];

  companyProfile.sicCodes.forEach(code => {
    sicCodeList.push({ code: code, description: lookupSicCodeDescription(code) } as SicCode);
  });

  return sicCodeList;
}

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
