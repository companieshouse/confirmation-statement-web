import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { savePreviousPageInSession } from "../utils/session-navigation";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { urlUtils } from "../utils/url";
import { getCompanyProfileFromSession } from "../utils/session";
import { getReviewPath, isACSPJourney } from '../utils/limited.partnership';
import { SIC_CODE_SESSION_KEY } from "../utils/constants";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  console.log("@@@@@@ GET session:", require('util').inspect(req.session, { showHidden: false, depth: null, colors: true }));

  const locales = getLocalesService();
  const previousPage = savePreviousPageInSession(req);
  const company: CompanyProfile = getCompanyProfileFromSession(req);

  const sicCodeList: SicCodeSummaryListItem[] = [];;
  if (company && company.sicCodes) {

    const sicCodesList = company.sicCodes;
    req.session?.setExtraData(SIC_CODE_SESSION_KEY, sicCodesList);
    for (const code of sicCodesList) {
      sicCodeList.push({
        sicCode: {
          code: code,
          description: code
        },
        removeUrl: urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}/${code}/remove?lang=${lang}`, req)
      });
    }
  }

  console.log("@@@@@@ GET session.getExtraData(SIC_CODE_SESSION_KEY):", require('util').inspect(req.session?.getExtraData(SIC_CODE_SESSION_KEY), { showHidden: false, depth: null, colors: true }));

  return res.render(Templates.LP_SIC_CODE_SUMMARY, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    previousPage,
    urls,
    sicCodes: sicCodeList,
    searchSicCodes: dummySearchSicCodes,
    company
  });
};

export const post = (req: Request, res: Response) => {
  console.log("@@@@@@ post");
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const isAcspJourney = isACSPJourney(req.originalUrl);
  const nextPage = getReviewPath(isAcspJourney);

  return res.redirect(
    urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
      nextPage,
      companyNumber,
      transactionId,
      submissionId
    )
  );

};

export const addSicCode = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Missing SIC code');
  }

  const duplicate = dummySicCodes.some(sc => sc.code === code);

  if (duplicate) {
    console.warn(`Duplicate SIC code: ${code} already exists.`);
  } else if (dummySicCodes.length >= 4) {
    console.warn(`Maximum number of SIC codes reached.`);
  } else {
    dummySicCodes.push({
      code,
      description: `Description for ${code}`
    });
  }

  res.redirect(urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`, req));
};

export const removeSicCode = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const removeSicCode = req.params.code;

    console.log("@@@@@@ 000");
  if (dummySicCodes.length <= 1) {
    console.log("@@@@@@ -1-1-1");
    console.warn("Attempt to remove SIC code was blocked. Limited Partnership requires at least one SIC code.");
    return res.redirect(urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`, req));
  }

  console.log("@@@@@@ 111");

  if (removeSicCode) {
    // const index = dummySicCodes.findIndex(sicCode => sicCode.code === removeSicCode);
    const sessionSicCodeList = req.session?.getExtraData(SIC_CODE_SESSION_KEY) as string[];
    const index = sessionSicCodeList.findIndex(sicCode => sicCode === removeSicCode);
    console.log("@@@@@@ index:",index);
    console.log("@@@@@@ removeSicCode:",removeSicCode);

    if (index !== -1) {
      // dummySicCodes.splice(index, 1);
      sessionSicCodeList.splice(index, 1);
      console.log("@@@@@@ 222");
    }
     console.log("@@@@@@ 333");
  }

  console.log("@@@@@@ POST session.getExtraData(SIC_CODE_SESSION_KEY):", require('util').inspect(req.session?.getExtraData(SIC_CODE_SESSION_KEY), { showHidden: false, depth: null, colors: true }));
  console.log("@@@@@@ POST company_profile:", require('util').inspect(req.session?.getExtraData("company_profile"), { showHidden: false, depth: null, colors: true }));


  return res.redirect(urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}?lang=${lang}`, req));
};

interface SicCode {
  code: string;
  description: string;
}
interface SicCodeSummaryListItem {
  sicCode: SicCode;
  removeUrl: string;
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
