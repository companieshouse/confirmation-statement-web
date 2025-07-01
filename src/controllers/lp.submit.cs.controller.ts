import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { savePreviousPageInSession } from "../utils/session-navigation";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const locales = getLocalesService();
  const previousPage = savePreviousPageInSession(req);

  return res.render(Templates.LP_CS_SUBMIT, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    urls,
    previousPage
  });
};

export const post = (req: Request, res: Response) => {
  
};

