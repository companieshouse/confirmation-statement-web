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

  return res.render(Templates.LP_SIC_CODE_SUMMARY, {
    ...getLocaleInfo(locales, lang), 
    htmlLang: lang, 
    previousPage,
    urls,
    sicCodes: dummySicCodes
  });
};

export const post = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const nextPage = `${urls.LIMITED_PARTNERSHIP_PATH + "/next-page"}?lang=${lang}`;
  
  res.redirect(nextPage);
};


const dummySicCodes = [
  { code: '64205', description: 'Activities of financial service holding companies' },
  { code: '64910', description: 'Financial leasing' },
  { code: '64922', description: 'Activities of mortgage finance companies' }
];