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
  if (!csDateValue.csDateYear || !csDateValue.csDateMonth || !csDateValue.csDateDay) {
    if (!csDateValue.csDateDay) {
      return localInfo.i18n.CDSErrorDateNoDay;
    } else if (!csDateValue.csDateMonth) {
      return localInfo.i18n.CDSErrorDateNoMonth;
    } else if (!csDateValue.csDateYear) {
      return localInfo.i18n.CDSErrorDateNoYear;
    }
  }

  // validate that user enters an invalid date
  const inputDateString = `${csDateValue.csDateYear}-${csDateValue.csDateMonth}-${csDateValue.csDateDay}`;
  if (!DATE_DAY_REGEX.test(csDateValue.csDateDay) ||
    !DATE_MONTH_REGEX.test(csDateValue.csDateMonth) ||
    !DATE_YEAR_REGEX.test(csDateValue.csDateYear) ||
    !(moment(inputDateString, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT).isValid())
  ) {
    return localInfo.i18n.CDSErrorDateWrong;
  }

  // validate that user enters non-numeric characters
  if (!isNumeric(csDateValue.csDateDay) || !isNumeric(csDateValue.csDateMonth) || !isNumeric(csDateValue.csDateYear)) {
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
