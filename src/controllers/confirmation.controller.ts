import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { ACCOUNTS_SIGNOUT_PATH } from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { getCompanyProfile } from "../services/company.profile.service";
import { isLimitedPartnershipCompanyType } from "../utils/session";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });

  const locales = getLocalesService();

  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const session = req.session as Session;
    const userEmail = session.data.signin_info?.user_profile?.email;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    const isLimitedPartnership = isLimitedPartnershipCompanyType(req);

    return res.render(Templates.CONFIRMATION, {
      ...getLocaleInfo(locales, lang),
      htmlLang: lang,
      signoutURL: ACCOUNTS_SIGNOUT_PATH,
      referenceNumber: transactionId,
      userEmail,
      company,
      confirmationScreen: true,
      isLimitedPartnership
    });
  } catch (e) {
    return next(e);
  }
};

