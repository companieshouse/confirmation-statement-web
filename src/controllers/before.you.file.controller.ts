import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const locales = getLocalesService();
  const previousPage = urls.LIMITED_PARTNERSHIP_PATH;

  return res.render(Templates.LP_BEFORE_YOU_FILE, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    urls,
    previousPage
  });
};

export const post = (req: Request, res: Response) => {
  const lang = req.cookies.lang || 'en';
  const nextPage = `${urls.LIMITED_PARTNERSHIP_PATH}?lang=${lang}`;

  res.redirect(nextPage);
};
