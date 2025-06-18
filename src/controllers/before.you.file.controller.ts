import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const previousPage = urls.CONFIRMATION_STATEMENT + urls.LIMITED_PARTNERSHIP;

  return res.render(Templates.BEFORE_YOU_FILE, {
    ...getLocaleInfo(locales, lang),
    urls,
    previousPage
  });
};

export const post = (req: Request, res: Response) => {
  //Update with next page when available
  const nextPage = urls.CONFIRMATION_STATEMENT + urls.LIMITED_PARTNERSHIP;

  res.redirect(nextPage);
};
