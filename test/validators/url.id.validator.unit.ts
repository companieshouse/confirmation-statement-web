import { isUrlIdValid } from "../../src/validators/url.id.validator";

describe("URL id validator tests", () => {

  describe("isUrlIdValid tests", () => {

    it("Should return true for an alphanumeric string with some special characters", () => {
      expect(isUrlIdValid("123-abc$456%def")).toBeTruthy();
    });

    it("Should return true for a 50 length string", () => {
      expect(isUrlIdValid("12345678901234567890123456789012345678901234567890")).toBeTruthy();
    });

    it("Should return false for undefined string", () => {
      expect(isUrlIdValid(undefined as unknown as string)).toBeFalsy();
    });

    it("Should return false for empty string", () => {
      expect(isUrlIdValid("")).toBeFalsy();
    });

    it("Should return false for null string", () => {
      expect(isUrlIdValid(null as unknown as string)).toBeFalsy();
    });

    it("Should return false for > 50 length string", () => {
      expect(isUrlIdValid("123456789012345678901234567890123456789012345678901")).toBeFalsy();
    });
  });
});
