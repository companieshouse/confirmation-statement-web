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
import {
    DMMMMYYYY_DATE_FORMAT,
    RADIO_BUTTON_VALUE,
    YYYYMMDD_WITH_HYPHEN_DATE_FORMAT,
    MATOMO_LIMITED_PARTNERSHIP_PAGE_NAME,
} from "../utils/constants";
import {
    getReviewPath,
    isPflpLimitedPartnershipCompanyType,
    isSpflpLimitedPartnershipCompanyType,
    isACSPJourney,
    CsDateValue,
} from "../utils/limited.partnership";
import { convertDateToString, formatDateString } from "../utils/date";
import {
    getCsDateInput,
    isTodayBeforeFileCsDate,
    validateDateSelectorValue,
    validateLastOrNextMadeUpDate,
} from "../validators/lp.cs.date.validator";
import {
    resetReviewCheckboxes,
    sendLimitedPartnershipTransactionUpdate,
} from "../utils/confirmation/limited.partnership.confirmation";

export const get = (req: Request, res: Response) => {
    const lang = selectLang(req.query.lang);
    const company: CompanyProfile = getCompanyProfileFromSession(req);
    const locales = getLocalesService();
    const acspSessionData = getAcspSessionData(req.session as Session) as AcspSessionData;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    res.cookie("lang", lang, { httpOnly: true });

    let csDateRadioValue: string | undefined = undefined;
    let csDateValue: CsDateValue = {
        csDateYear: "",
        csDateMonth: "",
        csDateDay: "",
    };

    if (acspSessionData && acspSessionData.changeConfirmationStatementDate !== null) {
        if (acspSessionData.changeConfirmationStatementDate) {
            csDateRadioValue = RADIO_BUTTON_VALUE.YES;
            if (acspSessionData.newConfirmationDate) {
                csDateValue = {
                    csDateYear: `${acspSessionData.newConfirmationDate.getFullYear()}`,
                    csDateMonth: `${acspSessionData.newConfirmationDate.getMonth() + 1}`,
                    csDateDay: `${acspSessionData.newConfirmationDate.getDate()}`,
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
        errorMessage: null,
        templateName: isTodayBeforeFileCsDate(company)
            ? MATOMO_LIMITED_PARTNERSHIP_PAGE_NAME.LP_CS_DATE_EARLY
            : MATOMO_LIMITED_PARTNERSHIP_PAGE_NAME.LP_CS_DATE_ON_TIME,
    });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
    try {
        const context = buildContext(req);
        const csDateValue: CsDateValue = {
            csDateYear: req.body["csDate-year"],
            csDateMonth: req.body["csDate-month"],
            csDateDay: req.body["csDate-day"],
        };

        if (!req.body) {
            return;
        }

        switch (req.body.confirmationStatementDate) {
            case RADIO_BUTTON_VALUE.YES: {
                return radioYesSelection(req, res, csDateValue, context);
            }
            case RADIO_BUTTON_VALUE.NO: {
                return radioNoSelection(req, res, context);
            }
            default: {
                reloadPageWithError({
                    req,
                    res,
                    lang: context.lang,
                    localInfo: context.localInfo,
                    company: context.company,
                    acspSessionData: context.acspSessionData,
                    errorMessage: context.localInfo.i18n.CDSErrorNoRadioSelected,
                });
            }
        }
    } catch (e) {
        return next(e);
    }
};

const buildContext = (req: Request): ConfirmationStatementContext => {
    const lang = selectLang(req.query.lang);
    const company: CompanyProfile = getCompanyProfileFromSession(req);
    const acspSessionData = getAcspSessionData(req.session as Session) as AcspSessionData;
    const locales = getLocalesService();
    const localInfo = getLocaleInfo(locales, lang);

    return {
        lang,
        company,
        acspSessionData,
        localInfo,
        isACSPJourney: isACSPJourney(req.originalUrl),
    };
};

const radioYesSelection = async (req: Request, res: Response, csDateValue, context: ConfirmationStatementContext) => {
    const { lang, company, acspSessionData, localInfo } = context;

    const errorMessage = validateDateSelectorValue(localInfo, csDateValue, company);

    if (errorMessage) {
        reloadPageWithError({
            req,
            res,
            lang,
            localInfo,
            company,
            acspSessionData,
            errorMessage,
            csDateRadioValue: RADIO_BUTTON_VALUE.YES,
            csDateValue,
        });
    } else {
        const csDateInput = new Date(
            Number(csDateValue.csDateYear),
            Number(csDateValue.csDateMonth) - 1,
            Number(csDateValue.csDateDay)
        );
        saveCsDateIntoSession(acspSessionData, true, csDateInput);
        await sendLimitedPartnershipTransactionUpdate(
            req,
            moment(csDateInput).format(YYYYMMDD_WITH_HYPHEN_DATE_FORMAT),
            null
        );

        return res.redirect(urlUtils.getUrlToPath(`${urls.LP_CHECK_YOUR_ANSWER_PATH}?lang=${lang}`, req));
    }
};

const radioNoSelection = async (req: Request, res: Response, context: ConfirmationStatementContext) => {
    const { lang, company, acspSessionData, localInfo, isACSPJourney } = context;
    const date = returnTodayOnlyIfBeforeFileCsDate(company); // Saved the date value into session if user clicked no in early screen
    saveCsDateIntoSession(acspSessionData, false, date);
    const updatedCsDateValue = {
        csDateYear: String(date?.getFullYear() || ""),
        csDateMonth: String((date?.getMonth() || 0) + 1),
        csDateDay: String(date?.getDate() || ""),
    };
    let errorMessage: string | undefined;

    if (date) {
        errorMessage = validateLastOrNextMadeUpDate(date, company, localInfo);
    }

    if (errorMessage) {
        return reloadPageWithError({
            req,
            res,
            lang,
            localInfo,
            company,
            acspSessionData,
            errorMessage,
            csDateRadioValue: RADIO_BUTTON_VALUE.NO,
            csDateValue: updatedCsDateValue,
        });
    }

    await sendLimitedPartnershipTransactionUpdate(
        req,
        convertDateToString(date, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT),
        null
    );

    const isPrivateFund: boolean =
        isPflpLimitedPartnershipCompanyType(company) || isSpflpLimitedPartnershipCompanyType(company);

    if (isPrivateFund) {
        resetReviewCheckboxes(req);
    }

    const reviewPath = getReviewPath(isACSPJourney);
    const path = isPrivateFund ? reviewPath : urls.LP_SIC_CODE_SUMMARY_PATH;

    const nextPage = urlUtils.getUrlToPath(`${path}?lang=${lang}`, req);
    res.redirect(nextPage);
};

function returnTodayOnlyIfBeforeFileCsDate(company: CompanyProfile): Date | null {
    return isTodayBeforeFileCsDate(company) ? moment().startOf("day").toDate() : null;
}

function reloadPageWithError(options: ReloadPageOptions) {
    const { req, res, lang, localInfo, company, acspSessionData, errorMessage, csDateRadioValue, csDateValue } =
        options;

    res.cookie("lang", lang, { httpOnly: true });

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
            text: errorMessage,
        },
        templateName: isTodayBeforeFileCsDate(company)
            ? MATOMO_LIMITED_PARTNERSHIP_PAGE_NAME.LP_CS_DATE_EARLY
            : MATOMO_LIMITED_PARTNERSHIP_PAGE_NAME.LP_CS_DATE_ON_TIME,
    });
}

function saveCsDateIntoSession(
    acspSessionData: AcspSessionData,
    isChangedConfirmationStatementDate: boolean,
    csDateInput: Date | null
) {
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

interface ReloadPageOptions {
    req: Request;
    res: Response;
    lang: string;
    localInfo: object;
    company: CompanyProfile;
    acspSessionData: AcspSessionData;
    errorMessage: string;
    csDateRadioValue?: string;
    csDateValue?: CsDateValue;
}

interface ConfirmationStatementContext {
    lang: string;
    company: CompanyProfile;
    acspSessionData: AcspSessionData;
    localInfo: ReturnType<typeof getLocaleInfo>;
    isACSPJourney: boolean;
}
