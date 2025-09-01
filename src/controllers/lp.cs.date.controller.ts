import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import * as urls from "../types/page.urls";
import moment from 'moment';
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { Session } from "@companieshouse/node-session-handler";
import { AcspSessionData, getAcspSessionData } from "../utils/session.acsp";
import { DMMMMYYYY_DATE_FORMAT, RADIO_BUTTON_VALUE } from "../utils/constants";
import { getReviewPath, isPflpLimitedPartnershipCompanyType, isSpflpLimitedPartnershipCompanyType, isACSPJourney } from '../utils/limited.partnership';
import { formatDateString, addDateFromDateString } from "../utils/date";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const company: CompanyProfile = getCompanyProfileFromSession(req);
  const locales = getLocalesService();
  const acspSessionData = getAcspSessionData(req.session as Session);
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  res.cookie('lang', lang, { httpOnly: true });

  let csDateRadioValue, csDateValue;
  if (acspSessionData && acspSessionData.changeConfirmationStatementDate !== null) {
    if (acspSessionData.changeConfirmationStatementDate) {
      csDateRadioValue = RADIO_BUTTON_VALUE.YES;
      if (acspSessionData.newConfirmationDate) {
        csDateValue = {
          "csDate-year": acspSessionData.newConfirmationDate.getFullYear(),
          "csDate-month": acspSessionData.newConfirmationDate.getMonth() + 1,
          "csDate-day": acspSessionData.newConfirmationDate.getDate()
        };
      }
    } else {
      csDateRadioValue = RADIO_BUTTON_VALUE.NO;
    }
  }

  return res.render(Templates.LP_CS_DATE, {
    ...getLocaleInfo(locales, lang),
    htmlLang: lang,
    previousPage: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
      urls.LP_BEFORE_YOU_FILE_PATH,
      companyNumber,
      transactionId,
      submissionId
    ),
    company,
    isTodayBeforeFileCsDate: isTodayBeforeFileCsDate(company),
    dateOfToday: moment().format(DMMMMYYYY_DATE_FORMAT),
    cdsCurrentDate: formatDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextDue as string),
    cdsMustFileByDate: addDateFromDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextDue as string, 14),
    csDateRadioValue,
    csDateValue,
    errorMessage: null
  });
};

export const post = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const company: CompanyProfile = getCompanyProfileFromSession(req);
  const acspSessionData = getAcspSessionData(req.session as Session) as AcspSessionData;
  const locales = getLocalesService();
  const localInfo = getLocaleInfo(locales, lang);
  const isAcspJourney = isACSPJourney(req.originalUrl);
  const reviewPath = getReviewPath(isAcspJourney);

  if (req.body) {
    switch (req.body.confirmationStatementDate) {
        case RADIO_BUTTON_VALUE.YES: {
          const csDateValue = {
            "csDate-year": req.body["csDate-year"],
            "csDate-month": req.body["csDate-month"],
            "csDate-day": req.body["csDate-day"]
          };

          let errorMessage = undefined;
          if (!(csDateValue["csDate-year"] && csDateValue["csDate-month"] && csDateValue["csDate-day"])) {
            errorMessage = localInfo.i18n.CDSDateValueMissingError;
          } else if (!(moment(`${csDateValue["csDate-year"]}-${csDateValue["csDate-month"]}-${csDateValue["csDate-day"]}`, 'YYYY-MM-DD').isValid())) {
            errorMessage = localInfo.i18n.CDSDateValueInvalidError;
          }

          if (errorMessage) {
            reloadPageWithError(req,
                                res,
                                lang,
                                localInfo,
                                company,
                                errorMessage,
                                RADIO_BUTTON_VALUE.YES,
                                csDateValue);
          } else {
            const csDateInput = new Date(csDateValue["csDate-year"], csDateValue["csDate-month"] - 1, csDateValue["csDate-day"]);
            saveCsDateIntoSession(acspSessionData, true, csDateInput);
            return res.redirect(urlUtils.getUrlToPath(`${urls.LP_CHECK_YOUR_ANSWER_PATH}?lang=${lang}`, req));
          }
          break;
        }
        case RADIO_BUTTON_VALUE.NO: {
          const date = isTodayBeforeFileCsDate(company) ? moment().startOf('day').toDate() : null; // Saved the date value into session if user clicked no in early screen
          saveCsDateIntoSession(acspSessionData, false, date);
          const path = (isPflpLimitedPartnershipCompanyType(company) || isSpflpLimitedPartnershipCompanyType(company))
            ? reviewPath
            : urls.LP_SIC_CODE_SUMMARY_PATH;

          const nextPage = urlUtils.getUrlToPath(`${path}?lang=${lang}`, req);
          res.redirect(nextPage);
          break;
        }
        default: {
          reloadPageWithError(req, res, lang, localInfo, company, localInfo.i18n.CDSRadioButtonError);
        }
    }
  }
};

function reloadPageWithError(req: Request, res: Response, lang: string, localInfo: object, company: CompanyProfile, errorMessage: string, csDateRadioValue?: string, csDateValue?: object) {
  res.cookie('lang', lang, { httpOnly: true });

  return res.render(Templates.LP_CS_DATE, {
    ...localInfo,
    htmlLang: lang,
    previousPage: urlUtils.getUrlToPath(urls.LP_BEFORE_YOU_FILE_PATH, req),
    company,
    isTodayBeforeFileCsDate: isTodayBeforeFileCsDate(company),
    dateOfToday: moment().format(DMMMMYYYY_DATE_FORMAT),
    cdsCurrentDate: formatDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextDue as string),
    cdsMustFileByDate: addDateFromDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextDue as string, 14),
    csDateRadioValue,
    csDateValue,
    errorMessage: {
      text: errorMessage
    }
  });
}

function saveCsDateIntoSession(acspSessionData: AcspSessionData, isChangedConfirmationStatementDate: boolean, csDateInput: Date | null) {
  if (acspSessionData) {
    acspSessionData.changeConfirmationStatementDate = isChangedConfirmationStatementDate;
    acspSessionData.newConfirmationDate = csDateInput;
  }
}

function isTodayBeforeFileCsDate(company: CompanyProfile): boolean {
  return moment().isBefore(moment(company.confirmationStatement?.nextDue), "day");
}


