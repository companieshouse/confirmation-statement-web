import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import * as urls from "../types/page.urls";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { savePreviousPageInSession } from "../utils/session-navigation";

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
        // ToDo URL to forward to for Check your answers
        get(req, res);
        break;
      case "no":
        res.redirect(urls.LP_SIC_CODE_SUMMARY_PATH);
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
    previousPage: urls.LP_BEFORE_YOU_FILE_PATH,
    errorMessage: {
      text: errorMessage
    }
  });
}

