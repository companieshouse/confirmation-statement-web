import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const locales = getLocalesService();

  return res.render(Templates.LP_START, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    urls
  });
};

export const post = (req: Request, res: Response) => {
  const lang = req.cookies.lang || 'en';
  const nextPage = `${urls.CONFIRMATION_STATEMENT + urls.BEFORE_YOU_FILE}?lang=${lang}`;

  res.redirect(nextPage);
};
