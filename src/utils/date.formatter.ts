import logger from "./logger";
import { DateTime } from "luxon";

export const readableFormat = (dateToConvert: string): string => {
  const jsDate = new Date(dateToConvert);
  const dateTime = DateTime.fromJSDate(jsDate);
  const convertedDate = dateTime.toFormat("dd MMMM yyyy");

  if (convertedDate === "Invalid DateTime") {
    const errorMsg = `Unable to convert provided date ${dateToConvert}`;
    const error = new Error(errorMsg);
    logger.error(`${errorMsg} - ${error.stack}`);
    throw error;
  }

  return convertedDate;
};
