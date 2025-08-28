import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getAcspSessionData, resetAcspSession, updateAcspSessionData } from "../utils/session.acsp";
import { urlUtils } from "../utils/url";
import { getCompanyProfileFromSession } from "../utils/session";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { getTransaction } from "services/transaction.service";

export const get = async (req: Request, res: Response) => {
  const session: Session = req.session as Session;
  const lang = selectLang(req.query.lang);
  res.cookie('lang', lang, { httpOnly: true });
  const company: CompanyProfile = getCompanyProfileFromSession(req);
  const locales = getLocalesService();
  const formData = { byfCheckbox: getAcspSessionData(session)?.beforeYouFileCheck ? 'confirm' : '' };
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const transaction: Transaction = await getTransaction(session, transactionId);



  return res.render(Templates.LP_BEFORE_YOU_FILE, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    urls,
    company,
    previousPageWithoutLang: `${urls.CONFIRM_COMPANY_PATH}?companyNumber=${urlUtils.getCompanyNumberFromRequestParams(req)}`,
    formData,
    isPaymentDue: isPaymentDue(transaction, submissionId)
    });
};

export const post = (req: Request, res: Response) => {
  const session: Session = req.session as Session;
  const lang = selectLang(req.query.lang);
  const localInfo = getLocaleInfo(getLocalesService(), lang);
  const nextPage = urlUtils.getUrlToPath(`${urls.LP_CS_DATE_PATH}?lang=${lang}`, req);
  const byfCheckbox = req.body.byfCheckbox;
  const isByfChecked = byfCheckbox === "confirm";

  if (!getAcspSessionData(session)) {
    resetAcspSession(session);
  }

  updateAcspSessionData(session, {
    beforeYouFileCheck: isByfChecked
  } );

  if (!byfCheckbox) {
    return reloadPageWithError(req, res, lang, localInfo, byfCheckbox, localInfo.i18n.BYFErrorMessageNotChecked);
  }

  res.redirect(nextPage);
};

function reloadPageWithError(req: Request, res: Response, lang: string, localInfo: object, byfCheckbox: string, errorMessage: string) {
  res.cookie('lang', lang, { httpOnly: true });
  res.render(Templates.LP_BEFORE_YOU_FILE, {
    ...localInfo,
    htmlLang: lang,
    urls,
    previousPage: urls.ACSP_LIMITED_PARTNERSHIP,
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
    }
  });
}

