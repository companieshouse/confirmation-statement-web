import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const previousPage = urls.CONFIRMATION_STATEMENT + urls.CS_DATE;
  const continuePage = urls.CONFIRMATION_STATEMENT + urls.LIMITED_PARTNERSHIP + "/#";

  return res.render(Templates.LP_CHECK_YOUR_ANSWER, {
    ...getLocaleInfo(locales, lang),
    previousPage,
    csDate: "11 December 2222",
    continuePage
  });
};
