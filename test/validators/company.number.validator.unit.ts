import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

describe("Company number validator tests", () => {

  describe("isCompanyNumberValid tests", () => {

    it("Should return true for a 8 digit number string", () => {
      expect(isCompanyNumberValid("12345678")).toBeTruthy();
    });

    it("Should return true for a 2 letters and 6 digit number string (uppercase)", () => {
      expect(isCompanyNumberValid("AB345678")).toBeTruthy();
    });

    it("Should return true for a 2 letters and 6 digit number string (lowercase)", () => {
      expect(isCompanyNumberValid("ab345678")).toBeTruthy();
    });

    it("Should return true for 1 letter 7 number string", () => {
      expect(isCompanyNumberValid("A1234567")).toBeTruthy();
    });

    it("Should return false for undefined string", () => {
      expect(isCompanyNumberValid(undefined as unknown as string)).toBeFalsy();
    });

    it("Should return false for empty string", () => {
      expect(isCompanyNumberValid("")).toBeFalsy();
    });

    it("Should return false for null string", () => {
      expect(isCompanyNumberValid(null as unknown as string)).toBeFalsy();
    });

    it("Should return false for > 8 length string", () => {
      expect(isCompanyNumberValid("123456789")).toBeFalsy();
    });

    it("Should return false for < 8 length string", () => {
      expect(isCompanyNumberValid("1234567")).toBeFalsy();
    });

    it("Should return false for 3 letter 5 number string", () => {
      expect(isCompanyNumberValid("ABC12345")).toBeFalsy();
    });
  });
});
