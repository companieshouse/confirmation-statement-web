import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import * as urls from "../types/page.urls";
import moment from "moment";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { Session } from "@companieshouse/node-session-handler";
import { AcspSessionData, getAcspSessionData } from "../utils/session.acsp";
import { DMMMMYYYY_DATE_FORMAT, RADIO_BUTTON_VALUE, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT } from "../utils/constants";
import { getReviewPath, isPflpLimitedPartnershipCompanyType, isSpflpLimitedPartnershipCompanyType, isACSPJourney, CsDateValue } from "../utils/limited.partnership";
import { convertDateToString, formatDateString } from "../utils/date";
import { isTodayBeforeFileCsDate, validateDateSelectorValue } from "../validators/lp.cs.date.validator";
import { sendLimitedPartnershipTransactionUpdate } from "../utils/confirmation/limited.partnership.confirmation";

export const get = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const company: CompanyProfile = getCompanyProfileFromSession(req);
  const locales = getLocalesService();
  const acspSessionData = getAcspSessionData(req.session as Session) as AcspSessionData;
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
          csDateYear: `${acspSessionData.newConfirmationDate.getFullYear()}`,
          csDateMonth: `${acspSessionData.newConfirmationDate.getMonth() + 1}`,
          csDateDay: `${acspSessionData.newConfirmationDate.getDate()}`
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
    cdsCurrentDate: formatDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextMadeUpTo as string),
    cdsMustFileByDate: formatDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextDue as string),
    newCsDate: getNewCsDateForEarlyScreen(acspSessionData),
    csDateRadioValue,
    csDateValue,
    errorMessage: null
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
            const csDateValue: CsDateValue = {
              csDateYear: req.body["csDate-year"],
              csDateMonth: req.body["csDate-month"],
              csDateDay: req.body["csDate-day"]
            };

            const errorMessage = validateDateSelectorValue(localInfo, csDateValue, company);

            if (errorMessage) {
              reloadPageWithError(req,
                                  res,
                                  lang,
                                  localInfo,
                                  company,
                                  acspSessionData,
                                  errorMessage,
                                  RADIO_BUTTON_VALUE.YES,
                                  csDateValue);
            } else {
              const csDateInput = new Date(Number(csDateValue.csDateYear), Number(csDateValue.csDateMonth) - 1, Number(csDateValue.csDateDay));
              saveCsDateIntoSession(acspSessionData, true, csDateInput);
              await sendLimitedPartnershipTransactionUpdate(req, moment(csDateInput).format(YYYYMMDD_WITH_HYPHEN_DATE_FORMAT), null);

              return res.redirect(urlUtils.getUrlToPath(`${urls.LP_CHECK_YOUR_ANSWER_PATH}?lang=${lang}`, req));
            }
            break;
          }
          case RADIO_BUTTON_VALUE.NO: {
            const date = returnTodayOnlyIfBeforeFileCsDate(company); // Saved the date value into session if user clicked no in early screen
            saveCsDateIntoSession(acspSessionData, false, date);
            await sendLimitedPartnershipTransactionUpdate(req, convertDateToString(date, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT), null);

            const path = (isPflpLimitedPartnershipCompanyType(company) || isSpflpLimitedPartnershipCompanyType(company))
              ? reviewPath
              : urls.LP_SIC_CODE_SUMMARY_PATH;

            const nextPage = urlUtils.getUrlToPath(`${path}?lang=${lang}`, req);
            res.redirect(nextPage);
            break;
          }
          default: {
            reloadPageWithError(req, res, lang, localInfo, company, acspSessionData, localInfo.i18n.CDSErrorNoRadioSelected);
          }
      }
    }
  } catch (e) {
    return next(e);
  }
};

function returnTodayOnlyIfBeforeFileCsDate(company: CompanyProfile): Date | null {
  return isTodayBeforeFileCsDate(company) ? moment().startOf('day').toDate() : null;
}

function reloadPageWithError(req: Request,
  res: Response,
  lang: string,
  localInfo: object,
  company: CompanyProfile,
  acspSessionData: AcspSessionData,
  errorMessage: string,
  csDateRadioValue?: string,
  csDateValue?: CsDateValue) {

  res.cookie('lang', lang, { httpOnly: true });

  return res.render(Templates.LP_CS_DATE, {
    ...localInfo,
    htmlLang: lang,
    previousPage: urlUtils.getUrlToPath(urls.LP_BEFORE_YOU_FILE_PATH, req),
    company,
    isTodayBeforeFileCsDate: isTodayBeforeFileCsDate(company),
    dateOfToday: moment().format(DMMMMYYYY_DATE_FORMAT),
    cdsCurrentDate: formatDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextMadeUpTo as string),
    cdsMustFileByDate: formatDateString(DMMMMYYYY_DATE_FORMAT, company.confirmationStatement?.nextDue as string),
    newCsDate: getNewCsDateForEarlyScreen(acspSessionData),
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

function getNewCsDateForEarlyScreen(acspSessionData: AcspSessionData): string {
  let newCsDateString = moment().format(DMMMMYYYY_DATE_FORMAT);
  if (acspSessionData?.newConfirmationDate) {
    newCsDateString = moment(acspSessionData.newConfirmationDate).format(DMMMMYYYY_DATE_FORMAT);
  }
  return newCsDateString;
}

