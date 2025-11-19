import { Request, Response } from "express";
import { CHS_URL, CS01_COST, PIWIK_START_GOAL_ID, FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021, EWF_URL, FEATURE_FLAG_SERVICE_WITHDRAWN_02102025 } from "../utils/properties";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();

  return res.render(Templates.START, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    CHS_URL,
    PIWIK_START_GOAL_ID,
    FEATURE_FLAG_SERVICE_WITHDRAWN_02102025,
    FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021,
    EWF_URL,
    CS01_COST,
    templateName: Templates.START });
};
