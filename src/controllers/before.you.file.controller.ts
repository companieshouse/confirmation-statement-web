import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const locales = getLocalesService();
  const previousPage = urls.CONFIRMATION_STATEMENT + urls.LIMITED_PARTNERSHIP;

  return res.render(Templates.BEFORE_YOU_FILE, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    urls,
    previousPage
  });
};

export const post = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const nextPage = `${urls.CONFIRMATION_STATEMENT + urls.LIMITED_PARTNERSHIP}?lang=${lang}`;
  const byfCheckbox = req.body.byfCheckbox; 
  const locales = getLocalesService();
  const localInfo = getLocaleInfo(locales, lang); 

  console.log("DAVE --- " + !byfCheckbox); 

  if(!byfCheckbox){
    return reloadPageWithError(req, res, lang, localInfo, byfCheckbox, localInfo.i18n.BYFErrorMessageNotChecked); 
  }

  res.redirect(nextPage);
};

function reloadPageWithError(req: Request, res: Response, lang: String, localInfo: Object, byfCheckbox: String, errorMessage: String) {
  res.cookie('lang', lang, { httpOnly: true}); 
  
  res.render(Templates.BEFORE_YOU_FILE, {
    ...localInfo,
    htmlLang: lang,
    urls,
    previousPage: urls.LIMITED_PARTNERSHIP,
    pageProperties: {
      errors: [
        {
          text: errorMessage, 
          href: '#byfCheckbox'
        }
      ], 
      isPost: true
    }, 
    formData: {
      byfCheckbox
    }
  }); 
}
