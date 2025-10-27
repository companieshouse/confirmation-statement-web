import { DateTime } from "luxon";
import { createAndLogError } from "./logger";
import moment from 'moment';
import { DMMMMYYYY_DATE_FORMAT, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT } from "./constants";
import { Request } from "express";
import { isTodayBeforeFileCsDate } from "../validators/lp.cs.date.validator";
import { getCompanyProfileFromSession } from "./session";

export const toReadableFormat = (dateToConvert: string): string => {
  if (!dateToConvert) {
    return "";
  }
  const jsDate = new Date(dateToConvert);
  const dateTime = DateTime.fromJSDate(jsDate);
  const convertedDate = dateTime.toFormat("d MMMM yyyy");

  if (convertedDate === "Invalid DateTime") {
    throw createAndLogError(`Unable to convert provided date ${dateToConvert}`);
  }

  return convertedDate;
};

export const isInFuture = (dateToCheckISO: string): boolean => {
  const today: DateTime = DateTime.now();
  const dateToCheck: DateTime = DateTime.fromISO(dateToCheckISO);
  const timeUnitDay = "day";

  return dateToCheck.startOf(timeUnitDay) > today.startOf(timeUnitDay);
};

export const toReadableFormatMonthYear = (monthNum: number, year: number): string => {
  const datetime = DateTime.fromObject({ month: monthNum });
  const convertedMonth = datetime.toFormat("MMMM");

  if (convertedMonth === "Invalid DateTime") {
    throw createAndLogError(`toReadableFormatMonthYear() - Unable to convert provided month ${monthNum}`);
  }

  return `${convertedMonth} ${year}`;
};

export const isValidDate = (dateAsString: string): boolean => {
  return !isNaN(Date.parse(dateAsString));
};

export const formatDateString = (resultDateFormat: string, dateAsString: string): string => {
  let formattedDateString = "";
  if (isValidDate(dateAsString)) {
    formattedDateString = moment(dateAsString).format(resultDateFormat);
  }
  return formattedDateString;
};

export const addDayToDateString = (resultDateFormat: string, dateAsString: string, dateToAdd: number): string => {
  let addedDateString = "";
  if (isValidDate(dateAsString)) {
    addedDateString = moment(dateAsString).add(dateToAdd, 'days').format(resultDateFormat);
  }
  return addedDateString;
};

export const convertDateToString = (date: Date | null, resultDateFormat: string): string | null => {
  return date ? moment(date).format(resultDateFormat) : null;
};



export function getFormattedConfirmationDate(newConfirmationDate?: Date | string | null, nextMadeUpTo?: string): string | undefined {
  if (isDefined(newConfirmationDate)) {
    return moment(newConfirmationDate).format(DMMMMYYYY_DATE_FORMAT);
  }

  if (nextMadeUpTo) {
    return formatDateString(DMMMMYYYY_DATE_FORMAT, nextMadeUpTo);
  }

  return undefined;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function getDateSubmission(newConfirmationDate: Date | null | undefined, req: Request): any {
  if (newConfirmationDate) {
    return moment(newConfirmationDate).format(YYYYMMDD_WITH_HYPHEN_DATE_FORMAT);
  }

  const date = isTodayBeforeFileCsDate(getCompanyProfileFromSession(req)) ? moment().startOf('day').toDate() : null;
  return convertDateToString(date, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT);
}
