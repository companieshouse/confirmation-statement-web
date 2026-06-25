import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import * as urls from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { urlUtils } from "../utils/url";
import { getCompanyProfileFromSession } from "../utils/session";
import { getReviewPath, isACSPJourney } from "../utils/limited.partnership";
import { SIC_CODE_SESSION_KEY, MATOMO_LIMITED_PARTNERSHIP_PAGE_NAME } from "../utils/constants";
import { AcspSessionData, getAcspSessionData } from "../utils/session.acsp";
import { Session } from "@companieshouse/node-session-handler";
import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";
import { SectionStatus, SicCodeData } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import {
    sendLimitedPartnershipTransactionUpdate,
    resetReviewCheckboxes,
} from "../utils/confirmation/limited.partnership.confirmation";
import { validateSicCodes } from "../services/sic.code.service";
import { getDateSubmission } from "../utils/date";

export const get = (req: Request, res: Response) => {
    const lang = selectLang(req.query.lang);
    res.cookie("lang", lang, { httpOnly: true });
    const company: CompanyProfile = getCompanyProfileFromSession(req);
    const sessionSicCodes = req.session?.getExtraData(SIC_CODE_SESSION_KEY);
    let sicCodesList: string[] = [];

    if (sessionSicCodes !== undefined) {
        sicCodesList = sessionSicCodes as string[];
    } else if (company?.sicCodes) {
        sicCodesList = company.sicCodes;
        req.session?.setExtraData(SIC_CODE_SESSION_KEY, sicCodesList);
    }

    const errors: { text: string }[] = req.session?.getExtraData("SIC_CODE_ERRORS") || [];
    req.session?.deleteExtraData("SIC_CODE_ERRORS");

    const sicCodeSummaryList = getSicCodeSummaryList(req, lang, sicCodesList);

    const removedLastSicCode =
        sessionSicCodes !== undefined &&
        Array.isArray(sessionSicCodes) &&
        (sessionSicCodes as string[]).length === 0 &&
        (company?.sicCodes?.length ?? 0) > 0;

    return renderPage(req, res, sicCodeSummaryList, sicCodesList, errors, removedLastSicCode);
};

export const saveAndContinue = async (req: Request, res: Response) => {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const company = getCompanyProfileFromSession(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const isAcspJourney = isACSPJourney(req.originalUrl);
    const nextPage = getReviewPath(isAcspJourney);
    const unsavedCodeList = req.body.unsavedCodeList ? req.body.unsavedCodeList.split(",") : [];
    const sessionData = getAcspSessionData(req.session as Session) as AcspSessionData;
    const allSicCodes: CondensedSicCodeData[] = sessionData?.sicCodes || [];
    const sicCodeArray: SicCode[] = [];

    const validationResults = validateSicCodes(unsavedCodeList, company?.sicCodes?.length ?? 0, allSicCodes);
    const errors = [
        ...(validationResults.maxError ? [{ text: validationResults.maxError }] : []),
        ...(validationResults.duplicateError ? [{ text: validationResults.duplicateError }] : []),
        ...(validationResults.invalidError ? [{ text: validationResults.invalidError }] : []),
    ];

    if (errors.length > 0) {
        if (validationResults.minError) {
            req.session?.setExtraData(SIC_CODE_SESSION_KEY, []);
        }

        req.session?.setExtraData("SIC_CODE_ERRORS", errors);

        return res.redirect(
            urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
                urls.LP_SIC_CODE_SUMMARY_PATH,
                companyNumber,
                transactionId,
                submissionId
            )
        );
    }

    for (const code of unsavedCodeList) {
        const matched = allSicCodes.find(sc => sc.sic_code === code);
        sicCodeArray.push({
            code: code,
            description: matched?.sic_description ?? "No Description Found.",
        });
    }

    const sicCodeList: SicCodeData = {
        sicCode: sicCodeArray,
        sectionStatus: SectionStatus.CONFIRMED,
    };

    req.session?.setExtraData(SIC_CODE_SESSION_KEY, unsavedCodeList);

    const submitDate = getDateSubmission(sessionData?.newConfirmationDate, req);

    await sendLimitedPartnershipTransactionUpdate(req, submitDate, sicCodeList);

    resetReviewCheckboxes(req);

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
    const { code } = req.body;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

    const unsavedCodeList = req.body.unsavedCodeList ? req.body.unsavedCodeList.split(",") : [];
    const sessionData = getAcspSessionData(req.session as Session) as AcspSessionData;
    const allSicCodes: CondensedSicCodeData[] = sessionData?.sicCodes || [];
    const isValidSicCode = allSicCodes.some(sic => sic.sic_code === code);

    if (!code || unsavedCodeList.includes(code) || !isValidSicCode || unsavedCodeList.length >= 4) {
        const errors: { text: string }[] = [];

        if (!code) {
            errors.push({ text: "Missing SIC code" });
        } else if (unsavedCodeList.includes(code)) {
            errors.push({
                text: "This SIC code already exists for the limited partnership. Enter a different SIC code",
            });
        } else if (unsavedCodeList.length >= 4) {
            errors.push({ text: "Remove SIC code(s). A limited partnership can only have a maximum of 4 SIC codes." });
        } else if (!isValidSicCode) {
            errors.push({ text: "Enter a valid SIC code" });
        } else {
            unsavedCodeList.push(code);
        }

        req.session?.setExtraData("SIC_CODE_ERRORS", errors);

        return res.redirect(
            urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
                urls.LP_SIC_CODE_SUMMARY_PATH,
                companyNumber,
                transactionId,
                submissionId
            )
        );
    }

    unsavedCodeList.push(code);
    req.session?.setExtraData(SIC_CODE_SESSION_KEY, unsavedCodeList);
    req.session?.deleteExtraData("SIC_CODE_ERRORS");

    return res.redirect(
        urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
            urls.LP_SIC_CODE_SUMMARY_PATH,
            companyNumber,
            transactionId,
            submissionId
        )
    );
};

export const removeSicCode = (req: Request, res: Response) => {
    const lang = selectLang(req.query.lang);
    const removeSicCode = req.params.code;
    const unsavedCodeList = req.body.unsavedCodeList ? req.body.unsavedCodeList.split(",") : [];

    if (removeSicCode) {
        const index = unsavedCodeList.findIndex((sicCode: string) => sicCode === removeSicCode);

        if (index !== -1) {
            unsavedCodeList.splice(index, 1);
        }
    }

    const sicCodeSummaryList = getSicCodeSummaryList(req, lang, unsavedCodeList);

    return renderPage(req, res, sicCodeSummaryList, unsavedCodeList, [], unsavedCodeList.length === 0);
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

    if (sicCodesList.length > 0) {
        for (const code of sicCodesList) {
            const matched = allSicCodes.find(sc => sc.sic_code === code);
            sicCodeSummaryList.push({
                sicCode: {
                    code: code,
                    description: matched?.sic_description ?? "No Description Found.",
                },
                removeUrl: urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_PATH}/${code}/remove?lang=${lang}`, req),
            });
        }
    }

    return sicCodeSummaryList;
}

export function renderPage(
    req: Request,
    res: Response,
    sicCodeSummaryList: SicCodeSummaryListItem[],
    unsavedCodeList: string[],
    errors: { text: string }[] = [],
    removedLastSICCode: boolean = false
): void {
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
        isShowingAddSection: sicCodeSummaryList.length < 4,
        addUrl: urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_ADD_PATH}?lang=${lang}`, req),
        saveUrl: urlUtils.getUrlToPath(`${urls.LP_SIC_CODE_SUMMARY_SAVE_PATH}?lang=${lang}`, req),
        searchSicCodes: sessionData.sicCodes.map(sic => ({
            ...sic,
            sic_description: sic.sic_description.trim(),
        })),
        company: company,
        unsavedCodeList: unsavedCodeList,
        errors,
        templateName: MATOMO_LIMITED_PARTNERSHIP_PAGE_NAME.LP_CS_SIC_CODE,
        displayRemovedAllSicCodes: removedLastSICCode,
    });
}
