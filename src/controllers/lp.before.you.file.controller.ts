import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getAcspSessionData, resetAcspSession, updateAcspSessionData } from "../utils/session.acsp";
import { urlUtils } from "../utils/url";
import { getCompanyProfileFromSession } from "../utils/session";
import { isPaymentDue } from '../utils/payments';
import { getSicCodeCondensedList } from "../services/sic.code.service";
import { fetchTransaction } from "../utils/confirmation/limited.partnership.confirmation";
import { LIMITED_PARTNERSHIP_LP_SUBTYPE, LIMITED_PARTNERSHIP_SLP_SUBTYPE } from "../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const session: Session = req.session as Session;
    const lang = selectLang(req.query.lang);
    res.cookie('lang', lang, { httpOnly: true });
    const company: CompanyProfile = getCompanyProfileFromSession(req);
    const locales = getLocalesService();
    const formData = { byfCheckbox: getAcspSessionData(session)?.beforeYouFileCheck ? 'confirm' : '' };
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const transaction = fetchTransaction(session, req);

    if (!getAcspSessionData(session)) {
      resetAcspSession(session);
    }

    const sicCodeList = await getSicCodeCondensedList();

    updateAcspSessionData(session, {
      sicCodes: sicCodeList
    });

    return res.render(Templates.LP_BEFORE_YOU_FILE, {
      ...getLocaleInfo(locales, lang),
      htmlLang: lang,
      urls,
      company,
      previousPageWithoutLang: `${urls.CONFIRM_COMPANY_PATH}?companyNumber=${urlUtils.getCompanyNumberFromRequestParams(req)}`,
      formData,
      isPaymentDue: isPaymentDue(await transaction, submissionId)
    });

  } catch (e) {
    return next(e);
  }

};

export const post = async (req: Request, res: Response) => {
  const session: Session = req.session as Session;
  const lang = selectLang(req.query.lang);
  const localInfo = getLocaleInfo(getLocalesService(), lang);
  const nextPage = urlUtils.getUrlToPath(`${urls.LP_CS_DATE_PATH}?lang=${lang}`, req);
  const byfCheckbox = req.body.byfCheckbox;
  const isByfChecked = byfCheckbox === "confirm";
  const company: CompanyProfile = getCompanyProfileFromSession(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const transaction = fetchTransaction(session, req);


  if (!getAcspSessionData(session)) {
    resetAcspSession(session);
  }

  updateAcspSessionData(session, {
    beforeYouFileCheck: isByfChecked
  });

  if (!byfCheckbox) {
    return reloadPageWithError(req, res, { lang, localInfo, byfCheckbox, company,
      isPaymentDue: isPaymentDue(await transaction, submissionId),
      errorMessage: localInfo.i18n.BYFErrorMessageNotChecked
    });
  }

  res.redirect(nextPage);
};

function reloadPageWithError(req: Request, res: Response, options: ReloadPageOptions): void {
  const { lang, localInfo, byfCheckbox, company, isPaymentDue, errorMessage } = options;
  res.cookie('lang', lang, { httpOnly: true });
  res.render(Templates.LP_BEFORE_YOU_FILE, {
    ...localInfo,
    htmlLang: lang,
    company: company,
    urls,
    previousPage: urls.ACSP_LIMITED_PARTNERSHIP,
    isPaymentDue: isPaymentDue,
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
    },
    showSICCodeReference: showSICCodeReference(getCompanyProfileFromSession(req)),
    previousPageWithoutLang: `${urls.CONFIRM_COMPANY_PATH}?companyNumber=${urlUtils.getCompanyNumberFromRequestParams(req)}`
  });
}

function showSICCodeReference(company: CompanyProfile): boolean {

  switch (company?.subtype) {
      case LIMITED_PARTNERSHIP_LP_SUBTYPE:
      case LIMITED_PARTNERSHIP_SLP_SUBTYPE:
        return true;
  }

  return false;
}

interface ReloadPageOptions {
  lang: string;
  localInfo: object;
  byfCheckbox: string;
  company: CompanyProfile;
  isPaymentDue: boolean;
  errorMessage: string;
}
