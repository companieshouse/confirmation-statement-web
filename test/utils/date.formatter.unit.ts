jest.mock("../../src/utils/logger");

import { readableFormat } from "../../src/utils/date.formatter";
import { logger } from "../../src/utils/logger";

describe("Date formatter tests", () => {

  it("Should return a human readable date from hyphanated-date string", () => {
    const dateString = "2019-03-18";
    const date = readableFormat(dateString);

    expect(date).toEqual("18 March 2019");
  });

  it("Should return a human readable date from local string", () => {
    const dateString = "March 18, 2019";
    const date = readableFormat(dateString);

    expect(date).toEqual("18 March 2019");
  });

  it("Should return empty string if date is undefined", () => {
    const input = undefined as unknown as string;
    const date = readableFormat(input);

    expect(date).toEqual("");
  });

  it("Should return empty string if date is null", () => {
    const input = null as unknown as string;
    const date = readableFormat(input);

    expect(date).toEqual("");
  });

  it("Should return empty string if date is empty string", () => {
    const input = "";
    const date = readableFormat(input);

    expect(date).toEqual("");
  });

  it("Should log and throw an error", () => {
    const badDate = "12345/44/44";

    try {
      readableFormat(badDate);
      fail();
    } catch (e) {
      expect(e.message).toContain(badDate);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(e.message));
    }
  });
});
