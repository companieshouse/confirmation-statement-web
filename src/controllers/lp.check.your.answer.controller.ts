import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { getAcspSessionData } from "../utils/session.acsp";
import { savePreviousPageInSession } from "../utils/session-navigation";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import * as urls from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import moment from 'moment';
import { getReviewPath, isPflpLimitedPartnershipCompanyType, isSpflpLimitedPartnershipCompanyType, isACSPJourney } from '../utils/limited.partnership';


export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const company: CompanyProfile = getCompanyProfileFromSession(req);
  const locales = getLocalesService();
  const previousPage = savePreviousPageInSession(req);
  const nextPage = urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`, req);
  const acspSessionData = getAcspSessionData(req.session as Session);
  const csDatePageUrl = urlUtils.getUrlToPath(`${urls.LP_CS_DATE_PATH}?lang=${lang}`, req);

  let csDateString;
  if (acspSessionData && acspSessionData.changeConfirmationStatementDate && acspSessionData.newConfirmationDate) {
    csDateString = moment(acspSessionData.newConfirmationDate).format("D MMMM YYYY");
  } else {
    return res.redirect(csDatePageUrl);
  }

  return res.render(Templates.LP_CHECK_YOUR_ANSWER, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    previousPage,
    company,
    csDate: csDateString,
    csDatePageUrl,
    nextPage
  });
};

export const post = async (req: Request, res: Response) => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const company: CompanyProfile = getCompanyProfileFromSession(req);
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
