import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";

export const get = (req: Request, res: Response) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    const company: CompanyProfile = getCompanyProfileFromSession(req);

    let prevPageURL = `${urls.CONFIRM_COMPANY_PATH}?companyNumber=${company.companyNumber}`;

    return res.render(Templates.LP_MUST_BE_AUTHORISED_AGENT, {
        ...getLocaleInfo(locales, lang),
        htmlLang: lang,
        previousPageWithoutLang: prevPageURL,
        applyAsACSPLink: addLangToUrl("/register-as-companies-house-authorised-agent", lang),
    });
};
