import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { urlUtils } from "../utils/url";
import * as urls from "../types/page.urls";

export const get = (req: Request, res: Response) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    let prevPageURL = `${urls.CONFIRM_COMPANY_PATH}?companyNumber=${urlUtils.getCompanyNumberFromRequestParams(req)}`;

    return res.render(Templates.LP_MUST_BE_AUTHORISED_AGENT, {
        ...getLocaleInfo(locales, lang),
        htmlLang: lang,
        previousPageWithoutLang: prevPageURL,
        applyAsACSPLink: addLangToUrl("/register-as-companies-house-authorised-agent", lang),
    });
};
