import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { savePreviousPageInSession } from "../utils/session-navigation";
import * as urls from "../types/page.urls";
import { urlUtils } from "../utils/url";


export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const previousPage = savePreviousPageInSession(req);

  return res.render(Templates.LP_CHECK_YOUR_ANSWER, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    previousPage,
    applyAsACSPLink: ,
  });
};
