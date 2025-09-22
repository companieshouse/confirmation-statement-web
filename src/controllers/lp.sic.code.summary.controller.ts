import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { urlUtils } from "../utils/url";
import { getCompanyProfileFromSession } from "../utils/session";
import { getReviewPath, isACSPJourney } from '../utils/limited.partnership';
import { SIC_CODE_SESSION_KEY } from "../utils/constants";
import { AcspSessionData, getAcspSessionData } from "../utils/session.acsp";
import { Session } from "@companieshouse/node-session-handler";
import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const company: CompanyProfile = getCompanyProfileFromSession(req);
  let sicCodesList: string[] = [];

  if (req.session?.getExtraData(SIC_CODE_SESSION_KEY)) {
    sicCodesList = req.session?.getExtraData(SIC_CODE_SESSION_KEY) as string[];
  } else if (company && company.sicCodes) {
    sicCodesList = company.sicCodes;
    req.session?.setExtraData(SIC_CODE_SESSION_KEY, sicCodesList);
  }

  const sicCodeSummaryList = getSicCodeSummaryList(req, lang, sicCodesList);

  return renderPage(req, res, sicCodeSummaryList, sicCodesList);
};

export const saveAndContinue = (req: Request, res: Response) => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const isAcspJourney = isACSPJourney(req.originalUrl);
  const nextPage = getReviewPath(isAcspJourney);

  const unsavedCodeList = req.body.unsavedCodeList ? req.body.unsavedCodeList.split(",") : [];

  if (unsavedCodeList) {
    req.session?.setExtraData(SIC_CODE_SESSION_KEY, unsavedCodeList);
  }

  return res.redirect(
    urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
      nextPage,
      companyNumber,
      transactionId,
      submissionId
    )
  );

};

export const getPreviousPagePath = (req: Request) => {
  const acspSessionData = getAcspSessionData(req.session as Session);

  if (acspSessionData?.changeConfirmationStatementDate) {
    return urls.LP_CHECK_YOUR_ANSWER_PATH;
  }

  return urls.LP_CS_DATE_PATH;
};

export const addSicCode = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Missing SIC code');
  }

  const unsavedCodeList = req.body.unsavedCodeList ? req.body.unsavedCodeList.split(",") : [];
  const duplicate = unsavedCodeList.includes(code);

  if (duplicate) {
    console.warn(`Duplicate SIC code: ${code} already exists.`);
  } else if (unsavedCodeList.length >= 4) {
    console.warn(`Maximum number of SIC codes reached.`);
  } else {
    unsavedCodeList.push(code);
  }

  const sicCodeSummaryList = getSicCodeSummaryList(req, lang, unsavedCodeList);

  return renderPage(req, res, sicCodeSummaryList, unsavedCodeList);
};

export const removeSicCode = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const removeSicCode = req.params.code;
  const unsavedCodeList = req.body.unsavedCodeList ? req.body.unsavedCodeList.split(",") : [];

  if (removeSicCode) {
    const index = unsavedCodeList.findIndex(sicCode => sicCode === removeSicCode);

    if (index !== -1) {
      unsavedCodeList.splice(index, 1);
    }
  }

  const sicCodeSummaryList = getSicCodeSummaryList(req, lang, unsavedCodeList);

  return renderPage(req, res, sicCodeSummaryList, unsavedCodeList);
};

interface SicCode {
  code: string;
  description: string;
}
interface SicCodeSummaryListItem {
  sicCode: SicCode;
  removeUrl: string;
}

export function getSicCodeSummaryList(req: Request, lang: string, sicCodesList: string[]): SicCodeSummaryListItem[] {
  const sessionData = getAcspSessionData(req.session as Session) as AcspSessionData;
  const allSicCodes: CondensedSicCodeData[] = sessionData?.sicCodes || [];
  const sicCodeSummaryList: SicCodeSummaryListItem[] = [];
  
  if (!allSicCodes.length) {
    return [];
  }

  for (const code of sicCodesList) {
    const macthed = allSicCodes.find(sc => sc.sic_code === code);
    sicCodeSummaryList.push({
      sicCode: {
        code: code,
        description: macthed?.sic_description || "No Description Found."
      },
      removeUrl: urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}/${code}/remove?lang=${lang}`, req)
    });
  }
  return sicCodeSummaryList;
}

export function renderPage(req: Request, res: Response, sicCodeSummaryList: SicCodeSummaryListItem[], unsavedCodeList: string[]): void {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const previousPage = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
    getPreviousPagePath(req),
    urlUtils.getCompanyNumberFromRequestParams(req),
    urlUtils.getTransactionIdFromRequestParams(req),
    urlUtils.getSubmissionIdFromRequestParams(req)
  );
  const company = getCompanyProfileFromSession(req);
  const sessionData = getAcspSessionData(req.session as Session) as AcspSessionData;

  return res.render(Templates.LP_SIC_CODE_SUMMARY, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    previousPage: previousPage,
    urls,
    sicCodes: sicCodeSummaryList,
    isShowingAddSection: (sicCodeSummaryList.length < 4),
    addUrl: urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_ADD_PATH}?lang=${lang}`, req),
    saveUrl: urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_SAVE_PATH}?lang=${lang}`, req),
    searchSicCodes: sessionData.sicCodes,
    company: company,
    unsavedCodeList: unsavedCodeList
  });
}
