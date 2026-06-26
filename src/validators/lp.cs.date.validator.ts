import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import moment from "moment";
import {
    DATE_DAY_REGEX,
    DATE_MONTH_REGEX,
    DATE_YEAR_REGEX,
    YYYYMMDD_WITH_HYPHEN_DATE_FORMAT,
} from "../utils/constants";
import { CsDateValue } from "../utils/limited.partnership";
import { formatDateString } from "../utils/date";
import { FEATURE_FLAG_LP_REFORM_DATE } from "../utils/properties";

export function isTodayBeforeFileCsDate(company: CompanyProfile): boolean {
    return moment().isBefore(moment(company.confirmationStatement?.nextMadeUpTo), "day");
}

export function isNumeric(input: string): boolean {
    return /^\d+$/.test(input);
}

export function validateDateSelectorValue(
    localInfo: any,
    csDateValue: CsDateValue,
    company: CompanyProfile
): string | undefined {
    // validate that the user selects ‘yes’ but does not enter a date
    if (!csDateValue.csDateYear && !csDateValue.csDateMonth && !csDateValue.csDateDay) {
        return localInfo.i18n.CDSErrorDateNoData;
    }

    // validate that user enters incomplete date
    const incompleteError = getIncompleteDateError(csDateValue, localInfo);
    if (incompleteError) {
        return incompleteError;
    }

    // validate format and numeric parts
    if (!isDateValid(csDateValue) || !isDateNumeric(csDateValue)) {
        return localInfo.i18n.CDSErrorDateWrong;
    }

    const csDateInput = getCsDateInput(csDateValue);

    // run a sequence of focused checks — each returns an error or undefined
    return (
        validateFutureDate(csDateInput, localInfo) ??
        validateMustFileBy(csDateInput, company, localInfo) ??
        validateRegistrationDate(csDateInput, company, localInfo) ??
        validateLpReformDate(csDateInput, localInfo) ??
        validateLastOrNextMadeUpDate(csDateInput, company, localInfo)
    );
}

function getIncompleteDateError(date: CsDateValue, localInfo: any): string | undefined {
    if (!date.csDateYear || !date.csDateMonth || !date.csDateDay) {
        if (!date.csDateDay) {
            return localInfo.i18n.CDSErrorDateNoDay;
        }
        if (!date.csDateMonth) {
            return localInfo.i18n.CDSErrorDateNoMonth;
        }
        if (!date.csDateYear) {
            return localInfo.i18n.CDSErrorDateNoYear;
        }
    }
    return undefined;
}

function isDateValid(date: CsDateValue): boolean {
    const inputDateString = `${date.csDateYear}-${date.csDateMonth}-${date.csDateDay}`;
    return (
        DATE_DAY_REGEX.test(date.csDateDay) &&
        DATE_MONTH_REGEX.test(date.csDateMonth) &&
        DATE_YEAR_REGEX.test(date.csDateYear) &&
        moment(inputDateString, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT).isValid()
    );
}

function isDateNumeric(date: CsDateValue): boolean {
    return isNumeric(date.csDateDay) && isNumeric(date.csDateMonth) && isNumeric(date.csDateYear);
}

export function getCsDateInput(date: CsDateValue): Date {
    return new Date(Number(date.csDateYear), Number(date.csDateMonth) - 1, Number(date.csDateDay));
}

function validateFutureDate(csDateInput: Date, localInfo: any): string | undefined {
    if (moment(csDateInput).isAfter(moment().startOf("day"))) {
        return localInfo.i18n.CDSErrorPastDate;
    }
    return undefined;
}

function validateMustFileBy(csDateInput: Date, company: CompanyProfile, localInfo: any): string | undefined {
    const mustFileByDate = company.confirmationStatement?.nextDue;
    if (mustFileByDate && moment(csDateInput).isAfter(moment(mustFileByDate), "day")) {
        const formattedMustFileBy = formatDateString("DD/MM/YYYY", mustFileByDate);
        return `${localInfo.i18n.CDSErrorDateAfterMustFileBy}${formattedMustFileBy}`;
    }
    return undefined;
}

function validateRegistrationDate(csDateInput: Date, company: CompanyProfile, localInfo: any): string | undefined {
    const registrationDate = company.dateOfCreation;
    if (registrationDate && moment(csDateInput).isBefore(moment(registrationDate), "day")) {
        return localInfo.i18n.CDSErrorDateBeforeRegistration;
    }
    return undefined;
}

function validateLpReformDate(csDateInput: Date, localInfo: any): string | undefined {
    if (FEATURE_FLAG_LP_REFORM_DATE && moment(csDateInput).isBefore(moment(FEATURE_FLAG_LP_REFORM_DATE), "day")) {
        const formattedReformDate = formatDateString("DD/MM/YYYY", FEATURE_FLAG_LP_REFORM_DATE);
        return `${localInfo.i18n.CDSErrorDateBeforeLpReform}${formattedReformDate}`;
    }
    return undefined;
}

export function validateLastOrNextMadeUpDate(
    csDateInput: Date,
    company: CompanyProfile,
    localInfo: any
): string | undefined {
    const lastOrNextMadeUpDate = isTodayBeforeFileCsDate(company)
        ? company?.confirmationStatement?.lastMadeUpTo
        : company.confirmationStatement?.nextMadeUpTo;
    if (!lastOrNextMadeUpDate) {
        return undefined;
    }

    if (moment(csDateInput).isSame(moment(lastOrNextMadeUpDate), "day")) {
        return localInfo.i18n.CDSErrorSameCsDate;
    }

    if (moment(csDateInput).isBefore(moment(lastOrNextMadeUpDate), "day")) {
        return localInfo.i18n.CDSErrorCsDateAfterlastCsDate;
    }

    return undefined;
}
