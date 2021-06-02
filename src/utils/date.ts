import { DateTime } from "luxon";
import { createAndLogError } from "./logger";

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

// export const diffInDays = (startDateISO: string, endDateISO: string): number => {
//   const start = DateTime.fromISO(startDateISO);
//   const end = DateTime.fromISO(endDateISO);
//   const diff: Duration = end.startOf("day").diff(start.startOf("day"), "days");

//   const days: number | undefined = diff.toObject().days;
//   // days can be 0 so a falsy check wouldn't work here
//   if (typeof days === "undefined") {
//     throw new Error(`Unable to check diffInDays between starDate = ${startDateISO} and endDate = ${endDateISO}`);
//   }
//   return days;
// };


export const isInFuture = (dateToCheckISO: string): boolean => {
  const today = DateTime.now();
  const dateToCheck = DateTime.fromISO(dateToCheckISO);

  return dateToCheck.startOf("day") > today.startOf("day");
};
