import { DateTime } from "luxon";
import { createAndLogError } from "./logger";

export const readableFormat = (dateToConvert: string): string => {
  if (!dateToConvert) {
    return "";
  }
  const jsDate = new Date(dateToConvert);
  const dateTime = DateTime.fromJSDate(jsDate);
  const convertedDate = dateTime.toFormat("dd MMMM yyyy");

  if (convertedDate === "Invalid DateTime") {
    throw createAndLogError(`Unable to convert provided date ${dateToConvert}`);
  }

  return convertedDate;
};
