jest.mock("../../src/utils/logger");

import { addDayToDateString, convertDateToString, formatDateString, getDateSubmission, isInFuture, isValidDate, toReadableFormat, toReadableFormatMonthYear } from "../../src/utils/date";
import { createAndLogError } from "../../src/utils/logger";
import { Settings as luxonSettings } from "luxon";
import { DMMMMYYYY_DATE_FORMAT, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT } from "../../src/utils/constants";
import moment from "moment";
import { getCompanyProfileFromSession } from "../../src/utils/session";
import { isTodayBeforeFileCsDate } from "../../src/validators/lp.cs.date.validator";
import { Request } from "express";
import * as dateUtils from '../../src/utils/date';

jest.mock("../../src/utils/session", () => ({
  getCompanyProfileFromSession: jest.fn(),
}));

jest.mock('../../src/validators/lp.cs.date.validator', () => ({
  isTodayBeforeFileCsDate: jest.fn(),
}));

const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

const today = "2020-04-25";

describe("Date tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    luxonSettings.now = () => new Date(today).valueOf();
  });

  describe("toReadableFormat tests", () => {
    it("Should return a human readable date from hyphanated-date string", () => {
      const dateString = "2019-03-01";
      const date = toReadableFormat(dateString);

      expect(date).toEqual("1 March 2019");
    });

    it("Should return a human readable date from local string", () => {
      const dateString = "March 18, 2019";
      const date = toReadableFormat(dateString);

      expect(date).toEqual("18 March 2019");
    });

    it("Should return empty string if date is undefined", () => {
      const input = undefined as unknown as string;
      const date = toReadableFormat(input);

      expect(date).toEqual("");
    });

    it("Should return empty string if date is null", () => {
      const input = null as unknown as string;
      const date = toReadableFormat(input);

      expect(date).toEqual("");
    });

    it("Should return empty string if date is empty string", () => {
      const input = "";
      const date = toReadableFormat(input);

      expect(date).toEqual("");
    });

    it("Should log and throw an error", () => {
      const badDate = "12345/44/44";

      try {
        toReadableFormat(badDate);
        fail();
      } catch (_e) {
        expect(mockCreateAndLogError).toHaveBeenCalledWith(expect.stringContaining(badDate));
      }
    });
  });

  describe("isInFuture tests", () => {
    it("Should return true for future date", () => {
      expect(isInFuture("2020-06-20")).toBeTruthy();
    });

    it("Should return false for today's date", () => {
      expect(isInFuture(today)).toBeFalsy();
    });

    it("Should return false for today's date with added hours", () => {
      expect(isInFuture("2020-04-25T14:00")).toBeFalsy();
    });

    it("Should return false for past date", () => {
      expect(isInFuture("2020-03-24")).toBeFalsy();
    });

    it("Should return false for undefined", () => {
      expect(isInFuture(undefined as unknown as string)).toBeFalsy();
    });

    it("Should return false for empty string", () => {
      expect(isInFuture("")).toBeFalsy();
    });

    it("Should return false for non date string", () => {
      expect(isInFuture("house")).toBeFalsy();
    });
  });

  describe("toReadableFormatMonthYear tests", () => {
    it("Should return readdable string", () => {
      expect(toReadableFormatMonthYear(1, 1965)).toBe("January 1965");
      expect(toReadableFormatMonthYear(12, 2006)).toBe("December 2006");
    });

    it("Should log and throw an error for invalid month", () => {
      const badMonth = 0;

      try {
        toReadableFormatMonthYear(badMonth, 1975);
        fail();
      } catch (_e) {
        expect(mockCreateAndLogError).toHaveBeenCalledWith(expect.stringContaining(badMonth.toString()));
      }
    });
  });

  describe("valid date tests", () => {

    it("Should return true for a valid date string", () => {
      const validity = isValidDate("2023-12-12");
      expect(validity).toEqual(true);
    });

    it("Should return false for an ivalid date string", () => {
      const validity = isValidDate("12-2023-12");
      expect(validity).toEqual(false);
    });

    it("Should return false for unsupplied date string", () => {
      const validity = isValidDate("");
      expect(validity).toEqual(false);
    });

  });

  describe("formatDateString tests", () => {

    it("Should return empty string if the date string is invalid", () => {
      const validity = formatDateString(DMMMMYYYY_DATE_FORMAT, "9999-99-99");
      expect(validity).toEqual("");
    });

    it("Should return English date string if the date string is valid", () => {
      const validity = formatDateString(DMMMMYYYY_DATE_FORMAT, "2025-09-01");
      expect(validity).toEqual("1 September 2025");
    });

    it("Should return date string if the date string is valid", () => {
      const validity = formatDateString("DD-MM-YYYY", "2025-09-01");
      expect(validity).toEqual("01-09-2025");
    });

  });

  describe("addDayToDateString tests", () => {

    it("Should return empty string if the date string is invalid", () => {
      const validity = addDayToDateString(DMMMMYYYY_DATE_FORMAT, "9999-99-99", 10);
      expect(validity).toEqual("");
    });

    it("Should return English date string if the date string is valid", () => {
      const validity = addDayToDateString(DMMMMYYYY_DATE_FORMAT, "2025-09-01", 10);
      expect(validity).toEqual("11 September 2025");
    });

    it("Should return date string if the date string is valid", () => {
      const validity = addDayToDateString("DD-YY-YYYY", "2025-09-01", 10);
      expect(validity).toEqual("11-25-2025");
    });

  });

  describe("convertDateToString tests", () => {

    it("Should return null if the date is null", () => {
      const validity = convertDateToString(null, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT);
      expect(validity).toEqual(null);
    });

    it("Should return date string if the date value is valid", () => {
      const validity = convertDateToString(new Date("2025/09/30"), YYYYMMDD_WITH_HYPHEN_DATE_FORMAT);
      expect(validity).toEqual("2025-09-30");
    });
  });

  describe('getDateSubmission', () => {
    const mockReq = {} as Request;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should format and return newConfirmationDate when provided', () => {
      const date = new Date('2023-10-01');
      const result = getDateSubmission(date, mockReq);
      expect(result).toBe(moment(date).format(YYYYMMDD_WITH_HYPHEN_DATE_FORMAT));
    });

    it('should return formatted current date when newConfirmationDate is null and today is before file CS date', () => {
      (isTodayBeforeFileCsDate as jest.Mock).mockReturnValue(true);
      const todayStart = moment().startOf('day').toDate();
      jest.spyOn(dateUtils, 'convertDateToString').mockReturnValue('2023-10-01');

      const result = getDateSubmission(null, mockReq);
      expect(getCompanyProfileFromSession).toHaveBeenCalledWith(mockReq);
      expect(isTodayBeforeFileCsDate).toHaveBeenCalled();
      expect(convertDateToString).toHaveBeenCalledWith(todayStart, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT);
      expect(result).toBe('2023-10-01');
    });

    it('should return null formatted when newConfirmationDate is null and today is not before file CS date', () => {
      (isTodayBeforeFileCsDate as jest.Mock).mockReturnValue(false);
      jest.spyOn(dateUtils, 'convertDateToString').mockReturnValue(null);

      const result = getDateSubmission(null, mockReq);
      expect(getCompanyProfileFromSession).toHaveBeenCalledWith(mockReq);
      expect(isTodayBeforeFileCsDate).toHaveBeenCalled();
      expect(convertDateToString).toHaveBeenCalledWith(null, YYYYMMDD_WITH_HYPHEN_DATE_FORMAT);
      expect(result).toBe(null);
    });
  });
});
