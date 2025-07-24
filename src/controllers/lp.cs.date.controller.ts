import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import * as urls from "../types/page.urls";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { savePreviousPageInSession } from "../utils/session-navigation";
import { urlUtils } from "../utils/url";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  res.cookie('lang', lang, { httpOnly: true });

  return res.render(Templates.LP_CS_DATE, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    previousPage: savePreviousPageInSession(req),
    errorMessage: null
  });
};

export const post = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const localInfo = getLocaleInfo(locales, lang);
  if (req.body) {
    switch (req.body.confirmationStatementDate) {
        case "yes":
          res.redirect(urlUtils.getUrlToPath(`${urls.LP_CHECK_YOUR_ANSWER_PATH}?lang=${lang}`, req));
          break;
        case "no":
          res.redirect(urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`, req));
          break;
        default:
          reloadPageWithError(req, res, lang, localInfo, localInfo.i18n.CDSRadioButtonError);
    }
  }
};

function reloadPageWithError(req: Request, res: Response, lang: string, localInfo: object, errorMessage: string) {
  res.cookie('lang', lang, { httpOnly: true });

  return res.render(Templates.LP_CS_DATE, {
    ...localInfo,
    htmlLang: lang,
    previousPage: urlUtils.getUrlToPath(urls.LP_BEFORE_YOU_FILE_PATH, req),
    errorMessage: {
      text: errorMessage
    }
  });
}

