import { isRadioButtonValid } from "../../src/validators/radio.button.validator";

describe("Company number validator tests", () => {

  describe("isCompanyNumberValid tests", () => {

    it("Should return true for a 8 digit number string", () => {
      expect(isRadioButtonValid("yes")).toBeTruthy();
    });

    it("Should return true for a 2 letters and 6 digit number string (uppercase)", () => {
      expect(isRadioButtonValid("no")).toBeTruthy();
    });

    it("Should return true for a 2 letters and 6 digit number string (lowercase)", () => {
      expect(isRadioButtonValid("recently_filed")).toBeTruthy();
    });

    it("Should return false for undefined string", () => {
      expect(isRadioButtonValid(undefined as unknown as string)).toBeTruthy();
    });

    it("Should return true for 1 letter 7 number string", () => {
      expect(isRadioButtonValid("malicious code block")).toBeFalsy();
    });
  });
});
