import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { ACCOUNTS_SIGNOUT_PATH, COMPANY_AUTH_PROTECTED_BASE, COMPANY_LOOKUP, LP_CONFIRMATION_PATH } from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { resetAcspSession } from "../utils/session.acsp";
import { getCompanyProfile } from "../services/company.profile.service";
import { isLimitedPartnershipCompanyType } from "../utils/limited.partnership";
import { COMPANY_PROFILE_SESSION_KEY, CONFIRMATION_STATEMENT_SESSION_KEY, LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY, PAYMENT_NONCE_SESSION_KEY, SIC_CODE_SESSION_KEY } from "../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const locales = getLocalesService();

  try {
    const session = req.session as Session;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);

    if (req.query.overview) {
      clearSessionExtraData(session);
      return res.redirect(urlUtils.getUrlWithCompanyNumber(COMPANY_AUTH_PROTECTED_BASE, companyNumber));
    }

    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const userEmail = session.data.signin_info?.user_profile?.email;
    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    const isLimitedPartnership = isLimitedPartnershipCompanyType(company);

    const hrefDifferentLimitedPartnership = encodeURI(COMPANY_LOOKUP);
    const hrefLimitedPartnershipOverview = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(LP_CONFIRMATION_PATH, companyNumber, transactionId, submissionId)  + '?overview=true';

    return res.render(Templates.CONFIRMATION, {
      ...getLocaleInfo(locales, lang),
      htmlLang: lang,
      signoutURL: ACCOUNTS_SIGNOUT_PATH,
      referenceNumber: transactionId,
      userEmail,
      company,
      confirmationScreen: true,
      isLimitedPartnership,
      hrefDifferentLimitedPartnership,
      hrefLimitedPartnershipOverview
    });
  } catch (e) {
    return next(e);
  }

  function clearSessionExtraData(session: Session) {
    resetAcspSession(session);
    session.deleteExtraData(SIC_CODE_SESSION_KEY);
    session.deleteExtraData(COMPANY_PROFILE_SESSION_KEY);
    session.deleteExtraData(PAYMENT_NONCE_SESSION_KEY);
    session.deleteExtraData(CONFIRMATION_STATEMENT_SESSION_KEY);
    session.deleteExtraData(LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY);
  }
};

