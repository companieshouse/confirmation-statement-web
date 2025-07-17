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
    sicCodes: dummySicCodes, 
    searchSicCodes: dummySearchSicCodes
  });
};

export const post = (req: Request, res: Response) => {
  const nextPage = urls.REVIEW_PATH
    .replace(":companyNumber", "11456298")
    .replace(":transactionId", "108098-393817-516389")
    .replace(":submissionId", "6867e3d393f03f3583e21e12");

  res.redirect(nextPage);
};

export const addSicCode = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Missing SIC code');
  }

  const duplicate = dummySicCodes.some(sc => sc.code === code); 

  if(duplicate) {
    console.warn(`Duplicate SIC code: ${code} already exists.`);  
  } else if (dummySicCodes.length >= 4) {
    console.warn(`Maximum number of SIC codes reached.`);  
  } else {
    dummySicCodes.push({
      code,
      description: `Description for ${code}`
    });    
  }

  res.redirect(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`);
};

export const removeSicCode = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const removeSicCode = req.params.code;

  if(dummySicCodes.length <= 1) {
    console.warn("Attempt to remove SIC code was blocked. Limited Partnership requires at least one SIC code."); 
    return res.redirect(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`);
  }

  if (removeSicCode) {
    const index = dummySicCodes.findIndex(sicCode => sicCode.code === removeSicCode);

    if (index !== -1) {
      dummySicCodes.splice(index, 1);
    }
  }

  return res.redirect(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`);
}

interface SicCode {
  code: string;
  description: string;
}

export const dummySicCodes: SicCode[] = [
  { code: '64205', description: 'Activities of financial service holding companies' },
  { code: '64910', description: 'Financial leasing' },
  { code: '64922', description: 'Activities of mortgage finance companies' }
];

export const dummySearchSicCodes: SicCode[] = [
  { code: '12345', description: 'First dummy search sic codes' },
  { code: '67890', description: 'Second dummy search sic codes' },
  { code: '12321', description: 'Third dummy search sic codes' }
];
