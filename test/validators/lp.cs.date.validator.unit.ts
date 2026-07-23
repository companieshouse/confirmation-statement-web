// Default mock: set LP reform date in the past so most tests are not affected.
jest.mock("../../src/utils/properties", () => ({ FEATURE_FLAG_LP_REFORM_DATE: "1970-01-01" }));

import { isTodayBeforeFileCsDate, validateDateSelectorValue } from "../../src/validators/lp.cs.date.validator";
import { validLimitedPartnershipProfile } from "../mocks/company.profile.mock";
import { CsDateValue } from "../../src/utils/limited.partnership";
import { getLocaleInfo, getLocalesService } from "../../src/utils/localise";
import * as csDateValidator from "../../src/validators/lp.cs.date.validator.ts";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import moment from "moment";

const locales = getLocalesService();
const localInfo = getLocaleInfo(locales, "en");

describe("LP CS date validator tests", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2021-03-01"));
    });

    it("isTodayBeforeFileCsDate should return false if today is not before expected CS filing date", () => {
        expect(isTodayBeforeFileCsDate(validLimitedPartnershipProfile)).toBeFalsy();
    });

    it("isTodayBeforeFileCsDate should return true if today is before expected CS filing date", () => {
        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2098-03-15",
            nextDue: "2099-03-29",
            nextMadeUpTo: "2099-03-15",
            overdue: false,
        };

        expect(isTodayBeforeFileCsDate(validLimitedPartnershipProfile)).toBeTruthy();
    });

    it("validateDateSelectorValue should return CDSErrorDateNoData error message if the CS date are missing day, month and year", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "",
            csDateMonth: "",
            csDateDay: "",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorDateNoData
        );
    });

    it("validateDateSelectorValue should return CDSErrorDateNoDay error message if the CS date is missing the day", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "2025",
            csDateMonth: "09",
            csDateDay: "",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorDateNoDay
        );
    });

    it("validateDateSelectorValue should return CDSErrorDateNoMonth error message if the CS date is missing the month", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "2025",
            csDateMonth: "",
            csDateDay: "10",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorDateNoMonth
        );
    });

    it("validateDateSelectorValue should return CDSErrorDateNoYear error message if the CS date is missing the year", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "",
            csDateMonth: "09",
            csDateDay: "10",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorDateNoYear
        );
    });

    it("validateDateSelectorValue should return CDSErrorDateWrong error message if the CS date contain character", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "a",
            csDateMonth: "b",
            csDateDay: "13",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorDateWrong
        );
    });

    it("validateDateSelectorValue should return CDSErrorDateWrong error message if the CS date is invalid", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "2025",
            csDateMonth: "02",
            csDateDay: "31",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorDateWrong
        );
    });

    it("validateDateSelectorValue should return CDSErrorEarlyPastDate error message if the CS date is in the future and filing is early", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "2099",
            csDateMonth: "12",
            csDateDay: "31",
        };

        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2098-03-15",
            nextDue: "2099-03-29",
            nextMadeUpTo: "2099-03-15",
            overdue: false,
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toContain(
            localInfo.i18n.CDSErrorEarlyPastDate
        );
    });

    it("validateDateSelectorValue should return CDSErrorEarlyPastDate when the CS date is in the future and filing is due", () => {
        const csDateValue: CsDateValue = {
            csDateYear: "2099",
            csDateMonth: "12",
            csDateDay: "31",
        };

        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2020-03-15",
            nextMadeUpTo: "2021-03-15", // In the past so isTodayBeforeFileCsDate() is false
            nextDue: "2099-03-29",
            overdue: true,
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorEarlyPastDate
        );
    });

    it("validateDateSelectorValue should return CDSErrorEarlyPastDate error message if the CS date is same as the date of lastMadeUpTo", () => {
        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2022-03-15",
            nextDue: "2099-03-29",
            nextMadeUpTo: "2099-03-15",
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: "2022",
            csDateMonth: "3",
            csDateDay: "15",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorEarlyPastDate
        );
    });

    it("validateDateSelectorValue should return CDSErrorEarlyPastDate error message if new CS date is before as the date of lastMadeUpTo if not filing on time", () => {
        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2098-03-15",
            nextDue: "2099-03-29",
            nextMadeUpTo: "2099-03-15",
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: "2022",
            csDateMonth: "3",
            csDateDay: "13",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorEarlyPastDate
        );
    });

    it("validateDateSelectorValue should NOT return CDSErrorCsDateAfterlastCsDate error message if new CS date is before as the date of lastMadeUpTo if filing is on time", () => {
        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2022-03-15",
            nextDue: "2099-03-29",
            nextMadeUpTo: "2099-03-15",
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: "2022",
            csDateMonth: "3",
            csDateDay: "13",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).not.toEqual(
            localInfo.i18n.CDSErrorCsDateAfterlastCsDate
        );
    });

    it("validateDateSelectorValue should return CDSErrorEarlyPastDate error message if the CS date is same as the date of nextMadeUpTo", () => {
        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2020-03-15",
            nextDue: "2021-03-29",
            nextMadeUpTo: "2021-03-15",
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: "2021",
            csDateMonth: "3",
            csDateDay: "15",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorEarlyPastDate
        );
    });

    it("should return CDSErrorSameCsDate when the CS date is the same as lastMadeUpTo for an early filing", () => {
        const today = moment();
        const lastMadeUpTo = today.clone().subtract(1, "month");
        const nextMadeUpTo = today.clone().add(1, "month");

        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: lastMadeUpTo.format("YYYY-MM-DD"),
            nextMadeUpTo: nextMadeUpTo.format("YYYY-MM-DD"),
            nextDue: nextMadeUpTo.clone().add(14, "days").format("YYYY-MM-DD"),
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: lastMadeUpTo.format("YYYY"),
            csDateMonth: lastMadeUpTo.format("M"),
            csDateDay: lastMadeUpTo.format("D"),
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorSameCsDate
        );
    });

    it("should return CDSErrorCsDateAfterlastCsDate when the CS date is before lastMadeUpTo for an early filing", () => {
        const today = moment().startOf("day");
        const lastMadeUpTo = today.clone().subtract(1, "month");
        const nextMadeUpTo = today.clone().add(1, "month");

        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: lastMadeUpTo.format("YYYY-MM-DD"),
            nextMadeUpTo: nextMadeUpTo.format("YYYY-MM-DD"),
            nextDue: nextMadeUpTo.clone().add(14, "days").format("YYYY-MM-DD"),
            overdue: false,
        };

        const csDate = lastMadeUpTo.clone().subtract(1, "day");

        const csDateValue: CsDateValue = {
            csDateYear: csDate.format("YYYY"),
            csDateMonth: csDate.format("M"),
            csDateDay: csDate.format("D"),
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorCsDateAfterlastCsDate
        );
    });

    it("validateDateSelectorValue should return CDSErrorEarlyPastDate error message if new CS date is before as the date of nextMadeUpTo", () => {
        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: "2020-03-15",
            nextDue: "2021-03-29",
            nextMadeUpTo: "2021-03-15",
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: "2021",
            csDateMonth: "3",
            csDateDay: "03",
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorEarlyPastDate
        );
    });

    it("should return CDSErrorSameCsDate when the CS date is the same as lastMadeUpTo for late filing", () => {
        const today = moment();
        const lastMadeUpTo = today.clone().subtract(14, "month");
        const nextMadeUpTo = today.clone().add(2, "month");

        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: lastMadeUpTo.format("YYYY-MM-DD"),
            nextMadeUpTo: nextMadeUpTo.format("YYYY-MM-DD"),
            nextDue: nextMadeUpTo.clone().add(14, "days").format("YYYY-MM-DD"),
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: lastMadeUpTo.format("YYYY"),
            csDateMonth: lastMadeUpTo.format("M"),
            csDateDay: lastMadeUpTo.format("D"),
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorSameCsDate
        );
    });

    it("should return CDSErrorSameCsDate when the CS date is the same as lastMadeUpTo for on time filing", () => {
        const today = moment();
        const lastMadeUpTo = today.clone().subtract(3, "days");
        const nextMadeUpTo = today.clone().add(2, "month");

        validLimitedPartnershipProfile.confirmationStatement = {
            lastMadeUpTo: lastMadeUpTo.format("YYYY-MM-DD"),
            nextMadeUpTo: nextMadeUpTo.format("YYYY-MM-DD"),
            nextDue: nextMadeUpTo.clone().add(14, "days").format("YYYY-MM-DD"),
            overdue: false,
        };

        const csDateValue: CsDateValue = {
            csDateYear: lastMadeUpTo.format("YYYY"),
            csDateMonth: lastMadeUpTo.format("M"),
            csDateDay: lastMadeUpTo.format("D"),
        };

        expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(
            localInfo.i18n.CDSErrorSameCsDate
        );
    });
});

describe("isDateOnTime", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-15"));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should return false when today is between nextMadeUpTo and nextDue", () => {
        const company: CompanyProfile = {
            ...validLimitedPartnershipProfile,
            confirmationStatement: {
                ...validLimitedPartnershipProfile.confirmationStatement,
                nextMadeUpTo: "2026-06-01",
                nextDue: "2026-06-30",
                overdue: false,
            },
        };

        expect(csDateValidator.isFilingDateEarly(company)).toBe(false);
    });

    it("should return true when today is before nextMadeUpTo", () => {
        const company: CompanyProfile = {
            ...validLimitedPartnershipProfile,
            confirmationStatement: {
                ...validLimitedPartnershipProfile.confirmationStatement,
                nextMadeUpTo: "2026-07-01",
                nextDue: "2026-07-31",
                overdue: false,
            },
        };

        expect(csDateValidator.isFilingDateEarly(company)).toBe(true);
    });

    it("should return false when today is after nextDue", () => {
        const company: CompanyProfile = {
            ...validLimitedPartnershipProfile,
            confirmationStatement: {
                ...validLimitedPartnershipProfile.confirmationStatement,
                nextMadeUpTo: "2026-05-01",
                nextDue: "2026-05-31",
                overdue: false,
            },
        };

        expect(csDateValidator.isFilingDateEarly(company)).toBe(false);
    });

    it("should return false when confirmation statement dates are missing", () => {
        const company: CompanyProfile = {
            ...validLimitedPartnershipProfile,
            confirmationStatement: {
                ...validLimitedPartnershipProfile.confirmationStatement,
                nextMadeUpTo: undefined,
                nextDue: undefined,
                overdue: false,
            },
        };

        expect(csDateValidator.isFilingDateEarly(company)).toBe(false);
    });

    afterEach(() => {
        jest.useRealTimers();
    });
});
