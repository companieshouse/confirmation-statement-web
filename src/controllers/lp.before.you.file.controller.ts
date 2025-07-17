import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { savePreviousPageInSession } from "../utils/session-navigation";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { validCompanyProfile } from "../../test/mocks/lp.company.profile.mock";


export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const company: CompanyProfile = validCompanyProfile;
  const locales = getLocalesService();
  const previousPage = savePreviousPageInSession(req);
  const formData = { byfCheckbox: req.cookies.byfCheckbox };

  return res.render(Templates.LP_BEFORE_YOU_FILE, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    urls,
    company,
    previousPage,
    formData
  });
};

export const post = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const nextPage = `${urls.LP_CS_DATE_PATH}?lang=${lang}`;
  const byfCheckbox = req.body.byfCheckbox;
  const locales = getLocalesService();
  const localInfo = getLocaleInfo(locales, lang);

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
    previousPage: urls.LIMITED_PARTNERSHIP,
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
