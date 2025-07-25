import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";


export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();

  return res.render(Templates.LP_MUST_BE_AUTHORISED_AGENT, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    applyAsACSPLink: addLangToUrl("/register-as-companies-house-authorised-agent", lang)
  });
};
