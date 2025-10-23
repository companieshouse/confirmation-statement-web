import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import moment from "moment";
import { DATE_DAY_REGEX, DATE_MONTH_REGEX, DATE_YEAR_REGEX, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT } from "../utils/constants";
import { CsDateValue } from "../utils/limited.partnership";


export function isTodayBeforeFileCsDate(company: CompanyProfile): boolean {
  return moment().isBefore(moment(company.confirmationStatement?.nextMadeUpTo), "day");
}

export function isNumeric(input: string): boolean {
  return /^\d+$/.test(input);
}

export function validateDateSelectorValue(localInfo: any, csDateValue: CsDateValue, company: CompanyProfile): string | undefined {

  // validate that the user selects ‘yes’ but does not enter a date
  if (!csDateValue.csDateYear && !csDateValue.csDateMonth && !csDateValue.csDateDay) {
    return localInfo.i18n.CDSErrorDateNoData;
  }

  // validate that user enters incomplete date
  const incompleteError = getIncompleteDateError(csDateValue, localInfo);
  if (incompleteError) {
    return incompleteError;
  }

  // validate that user enters an invalid date
  if (!isDateValid(csDateValue)) {
    return localInfo.i18n.CDSErrorDateWrong;
  }

  // validate that user enters non-numeric characters
  if (!isDateNumeric(csDateValue)) {
    return localInfo.i18n.CDSErrorDateWrong;
  }

  // validate that user enters a date in the future
  const csDateInput = new Date(Number(csDateValue.csDateYear), Number(csDateValue.csDateMonth) - 1, Number(csDateValue.csDateDay));
  if (moment(csDateInput).isAfter(moment().startOf('day'))) {
    return localInfo.i18n.CDSErrorPastDate;
  }

  const lastOrNextMadeUpDate = isTodayBeforeFileCsDate(company) ? company?.confirmationStatement?.lastMadeUpTo : company.confirmationStatement?.nextMadeUpTo;
  if (lastOrNextMadeUpDate) {
    // validate that user tries to enter a duplicate filing date
    if (moment(csDateInput).isSame(moment(lastOrNextMadeUpDate), "day")) {
      return localInfo.i18n.CDSErrorSameCsDate;
    }

    // validate that user tries to enter a past date that is already covered in a previous CS
    if (moment(csDateInput).isBefore(moment(lastOrNextMadeUpDate), "day")) {
      return localInfo.i18n.CDSErrorCsDateAfterlastCsDate;
    }
  }

  return undefined;
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
  return (
    isNumeric(date.csDateDay) &&
    isNumeric(date.csDateMonth) &&
    isNumeric(date.csDateYear)
  );
}
