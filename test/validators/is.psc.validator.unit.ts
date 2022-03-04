import { isPscFlagValid } from "../../src/validators/is.psc.validator";

describe("is PSC validator tests", () => {

  describe("isPscValid tests", () => {

    it("Should return true for a string with value 'true'", () => {
      expect(isPscFlagValid("true")).toBeTruthy();
    });

    it("Should return true for a string with value 'false'", () => {
      expect(isPscFlagValid("false")).toBeTruthy();
    });

    it("Should return false for undefined string", () => {
      expect(isPscFlagValid(undefined as unknown as string)).toBeFalsy();
    });

    it("Should return false for empty string", () => {
      expect(isPscFlagValid("")).toBeFalsy();
    });

    it("Should return false for null string", () => {
      expect(isPscFlagValid(null as unknown as string)).toBeFalsy();
    });

    it("Should return false for a long string", () => {
      expect(isPscFlagValid("falseeeeeeeee")).toBeFalsy();
    });

    it("Should return false for a short string", () => {
      expect(isPscFlagValid("tru")).toBeFalsy();
    });
  });
});
