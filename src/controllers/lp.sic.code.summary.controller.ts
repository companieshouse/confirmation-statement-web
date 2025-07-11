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
  const nextPage = urls.REVIEW_PATH
    .replace(":companyNumber", "11456298")
    .replace(":transactionId", "108098-393817-516389")
    .replace(":submissionId", "6867e3d393f03f3583e21e12");

  
  res.redirect(nextPage);
};

export const addSicCode = async (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const { code } = req.body;

  if (!code) return res.status(400).send('Missing SIC code');

  dummySicCodes.push({
    code,
    description: `Description for ${code}`
  });

  res.redirect(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`);
};

export const removeSicCode = async (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const removeSicCode = req.params.code;

  if (removeSicCode) {
    const index = dummySicCodes.findIndex(sicCode => sicCode.code === removeSicCode);

    if (index !== -1) {
      dummySicCodes.splice(index, 1);
    }
  }

  res.redirect(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`);
}


export const dummySicCodes = [
  { code: '64205', description: 'Activities of financial service holding companies' },
  { code: '64910', description: 'Financial leasing' },
  { code: '64922', description: 'Activities of mortgage finance companies' }
];