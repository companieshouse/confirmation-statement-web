import { isTodayBeforeFileCsDate, validateDateSelectorValue } from "../../src/validators/lp.cs.date.validator";
import { validLimitedPartnershipProfile } from "../mocks/company.profile.mock";
import { CsDateValue } from '../../src/utils/limited.partnership';
import { getLocaleInfo, getLocalesService } from "../../src/utils/localise";

const locales = getLocalesService();
const localInfo = getLocaleInfo(locales, "en");


describe("LP CS date validator tests", () => {

  it("isTodayBeforeFileCsDate should return false if today is not before expected CS filing date", () => {

    expect(isTodayBeforeFileCsDate(validLimitedPartnershipProfile)).toBeFalsy();
  });


  it("isTodayBeforeFileCsDate should return true if today is before expected CS filing date", () => {
    validLimitedPartnershipProfile.confirmationStatement = {
      lastMadeUpTo: "2098-03-15",
      nextDue: "2099-03-29",
      nextMadeUpTo: "2099-03-15",
      overdue: false
    };

    expect(isTodayBeforeFileCsDate(validLimitedPartnershipProfile)).toBeTruthy();
  });


  it("validateDateSelectorValue should return CDSErrorDateNoData error message if the CS date are missing day, month and year", () => {

    const csDateValue: CsDateValue = {
      csDateYear: "",
      csDateMonth: "",
      csDateDay: ""
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorDateNoData);
  });

  it("validateDateSelectorValue should return CDSErrorDateNoDay error message if the CS date is missing the day", () => {

    const csDateValue: CsDateValue = {
      csDateYear: "2025",
      csDateMonth: "09",
      csDateDay: ""
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorDateNoDay);
  });

  it("validateDateSelectorValue should return CDSErrorDateNoMonth error message if the CS date is missing the month", () => {

    const csDateValue: CsDateValue = {
      csDateYear: "2025",
      csDateMonth: "",
      csDateDay: "10"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorDateNoMonth);
  });

  it("validateDateSelectorValue should return CDSErrorDateNoYear error message if the CS date is missing the year", () => {

    const csDateValue: CsDateValue = {
      csDateYear: "",
      csDateMonth: "09",
      csDateDay: "10"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorDateNoYear);
  });

  it("validateDateSelectorValue should return CDSErrorDateWrong error message if the CS date contain character", () => {

    const csDateValue: CsDateValue = {
      csDateYear: "a",
      csDateMonth: "b",
      csDateDay: "13"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorDateWrong);
  });

  it("validateDateSelectorValue should return CDSErrorDateWrong error message if the CS date is invalid", () => {

    const csDateValue: CsDateValue = {
      csDateYear: "2025",
      csDateMonth: "02",
      csDateDay: "31"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorDateWrong);
  });

  it("validateDateSelectorValue should return CDSErrorPastDate error message if the CS date is in the future", () => {

    const csDateValue: CsDateValue = {
      csDateYear: "2099",
      csDateMonth: "12",
      csDateDay: "31"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorPastDate);
  });

  it("validateDateSelectorValue should return CDSErrorSameCsDate error message if the CS date is same as the date of lastMadeUpTo", () => {

    validLimitedPartnershipProfile.confirmationStatement = {
      lastMadeUpTo: "2022-03-15",
      nextDue: "2099-03-29",
      nextMadeUpTo: "2099-03-15",
      overdue: false
    };

    const csDateValue: CsDateValue = {
      csDateYear: "2022",
      csDateMonth: "3",
      csDateDay: "15"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorSameCsDate);
  });

  it("validateDateSelectorValue should return CDSErrorCsDateAfterlastCsDate error message if new CS date is before as the date of lastMadeUpTo", () => {

    validLimitedPartnershipProfile.confirmationStatement = {
      lastMadeUpTo: "2022-03-15",
      nextDue: "2099-03-29",
      nextMadeUpTo: "2099-03-15",
      overdue: false
    };

    const csDateValue: CsDateValue = {
      csDateYear: "2022",
      csDateMonth: "3",
      csDateDay: "13"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorCsDateAfterlastCsDate);
  });

  it("validateDateSelectorValue should not return error message if the date of lastMadeUpTo is missing", () => {

    validLimitedPartnershipProfile.confirmationStatement = {
      nextDue: "2099-03-29",
      nextMadeUpTo: "2099-03-15",
      overdue: false
    };

    const csDateValue: CsDateValue = {
      csDateYear: "2022",
      csDateMonth: "3",
      csDateDay: "13"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(undefined);
  });

  it("validateDateSelectorValue should return CDSErrorSameCsDate error message if the CS date is same as the date of nextMadeUpTo", () => {

    validLimitedPartnershipProfile.confirmationStatement = {
      lastMadeUpTo: "2020-03-15",
      nextDue: "2021-03-29",
      nextMadeUpTo: "2021-03-15",
      overdue: false
    };

    const csDateValue: CsDateValue = {
      csDateYear: "2021",
      csDateMonth: "3",
      csDateDay: "15"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorSameCsDate);
  });

  it("validateDateSelectorValue should return CDSErrorCsDateAfterlastCsDate error message if new CS date is before as the date of nextMadeUpTo", () => {

    validLimitedPartnershipProfile.confirmationStatement = {
      lastMadeUpTo: "2020-03-15",
      nextDue: "2021-03-29",
      nextMadeUpTo: "2021-03-15",
      overdue: false
    };

    const csDateValue: CsDateValue = {
      csDateYear: "2021",
      csDateMonth: "3",
      csDateDay: "03"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(localInfo.i18n.CDSErrorCsDateAfterlastCsDate);
  });

  it("validateDateSelectorValue should not return error message if the date of nextMadeUpTo is missing", () => {

    validLimitedPartnershipProfile.confirmationStatement = {
      lastMadeUpTo: "2020-03-15",
      nextDue: "2021-03-29",
      nextMadeUpTo: "",
      overdue: false
    };

    const csDateValue: CsDateValue = {
      csDateYear: "2021",
      csDateMonth: "3",
      csDateDay: "03"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(undefined);
  });

  it("validateDateSelectorValue should pass the checking without error message if the CS date is valid", () => {

    validLimitedPartnershipProfile.confirmationStatement = {
      lastMadeUpTo: "2024-05-01",
      nextDue: "2025-05-15",
      nextMadeUpTo: "2025-05-01",
      overdue: false
    };

    const csDateValue: CsDateValue = {
      csDateYear: "2025",
      csDateMonth: "5",
      csDateDay: "20"
    };

    expect(validateDateSelectorValue(localInfo, csDateValue, validLimitedPartnershipProfile)).toEqual(undefined);
  });

});
