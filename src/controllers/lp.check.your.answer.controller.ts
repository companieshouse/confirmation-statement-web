import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { savePreviousPageInSession } from "../utils/session-navigation";
import * as urls from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { getReviewPath, isPflpLimitedPartnershipCompanyType, isSpflpLimitedPartnershipCompanyType, isACSPJourney } from '../utils/limited.partnership';


export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const previousPage = savePreviousPageInSession(req);
  const nextPage = urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`, req);

  return res.render(Templates.LP_CHECK_YOUR_ANSWER, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    previousPage,
    csDate: "11 December 2222",
    nextPage
  });
};

export const post = async (req: Request, res: Response) => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const company: CompanyProfile = await getCompanyProfile(companyNumber);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const isAcspJourney = isACSPJourney(req.originalUrl);
  const reviewPath = getReviewPath(isAcspJourney);

  const nextPage = (isPflpLimitedPartnershipCompanyType(company) || isSpflpLimitedPartnershipCompanyType(company))
    ? reviewPath
    : urls.LP_SIC_CODE_SUMMARY_PATH;

  return res.redirect(
    urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
      nextPage,
      companyNumber,
      transactionId,
      submissionId
    )
  );
};
