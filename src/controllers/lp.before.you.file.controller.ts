import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { urlUtils } from "../utils/url";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const company: CompanyProfile = getCompanyProfileFromSession(req);
  const locales = getLocalesService();
  const formData = { byfCheckbox: req.cookies.byfCheckbox };

  return res.render(Templates.LP_BEFORE_YOU_FILE, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    urls,
    company,
    previousPageWithoutLang: `${urls.CONFIRM_COMPANY_PATH}?companyNumber=${urlUtils.getCompanyNumberFromRequestParams(req)}`,
    formData
  });
};

export const post = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const nextPage = urlUtils.getUrlToPath(`${urls.LP_CS_DATE_PATH}?lang=${lang}`, req);
  const byfCheckbox = req.body.byfCheckbox;
  const localInfo = getLocaleInfo(getLocalesService(), lang);

  if (!byfCheckbox) {
    return reloadPageWithError(req, res, lang, localInfo, byfCheckbox, localInfo.i18n.BYFErrorMessageNotChecked);
  }

  res.cookie('byfCheckbox', byfCheckbox, { httpOnly: true });
  res.redirect(nextPage);
};

function reloadPageWithError(req: Request, res: Response, lang: string, localInfo: object, byfCheckbox: string, errorMessage: string) {
  res.cookie('lang', lang, { httpOnly: true });
  res.render(Templates.LP_BEFORE_YOU_FILE, {
    ...localInfo,
    htmlLang: lang,
    urls,
    previousPage: urls.ACSP_LIMITED_PARTNERSHIP,
    pageProperties: {
      errors: [
        {
          text: errorMessage,
          href: '#byfCheckbox'
        }
      ],
      isPost: true
    },
    formData: {
      byfCheckbox
    }
  });
}
