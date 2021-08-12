import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, SIC_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { lookupSicCodeDescription } from "../../utils/api.enumerations";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { RADIO_BUTTON_VALUE, SECTIONS, SIC_CODE_ERROR } from "../../utils/constants";
import { SectionStatus, SicCode } from "private-api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const sicCodes: SicCode[] = getSicCodeDetails(companyProfile);
    return res.render(Templates.SIC, { backLinkUrl, sicCodes, templateName: Templates.SIC });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const sicButtonValue = req.body.sicCodeStatus;

  if (sicButtonValue === RADIO_BUTTON_VALUE.YES) {
    await sendUpdate(req, SectionStatus.CONFIRMED, SECTIONS.SIC);
    return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
  }

  if (sicButtonValue === RADIO_BUTTON_VALUE.NO) {
    await sendUpdate(req, SectionStatus.NOT_CONFIRMED, SECTIONS.SIC);
    return res.render(Templates.WRONG_SIC, {
      backLinkUrl: urlUtils.getUrlToPath(SIC_PATH, req),
      templateName: Templates.SIC,
      sickCodeStatus: sicButtonValue
    });
  }

  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    return res.render(Templates.SIC, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
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

