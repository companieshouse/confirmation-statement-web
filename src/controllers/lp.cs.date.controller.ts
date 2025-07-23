import { NextFunction, Request, Response } from "express";
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
    previousPage:savePreviousPageInSession(req),
    errorMessage:null
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const localInfo = getLocaleInfo(locales, lang);
  
  if (req.body) {
    switch (req.body.confirmationStatementDate) {
      case "yes":
        // ToDo URL to forward to for Check your answers
        get(req, res);
        break;
      case "no":
        res.redirect(urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`, req));
        break;
      default:
        reloadPageWithError(req, res, lang, localInfo, localInfo.i18n.CDSRadioButtonError);

    }
  }
};

function reloadPageWithError(req: Request, res: Response, lang: String, localInfo: Object, errorMessage: String) {
  res.cookie('lang', lang, { httpOnly: true });

  return res.render(Templates.LP_CS_DATE, {
    ...localInfo,
    htmlLang: lang,
    previousPage:urlUtils.getUrlToPath(urls.LP_BEFORE_YOU_FILE_PATH, req),
    errorMessage:{
      text: errorMessage
    }
  });
}

