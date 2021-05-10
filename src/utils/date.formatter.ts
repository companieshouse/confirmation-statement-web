import logger from "./logger";

export const readableFormat = (dateToConvert: string): string => {
  const dateTime = new Date(dateToConvert);
  const convertedDate = dateTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  if (convertedDate === "Invalid Date") {
    const errorMsg = `Unable to convert provided date ${dateToConvert} `;
    const error = new Error(errorMsg);
    logger.error(`${errorMsg} - ${error.stack}`);
    throw error;
  }
  return convertedDate;
};
