import { isRadioButtonValid } from "../../src/validators/radio.button.validator";

describe("radio button validator tests", () => {

  describe("isRadioButtonValid tests", () => {

    it("Should return true for a yes radio button value", () => {
      expect(isRadioButtonValid("yes")).toBeTruthy();
    });

    it("Should return true for a no radio button value", () => {
      expect(isRadioButtonValid("no")).toBeTruthy();
    });

    it("Should return true for a recently_filed radio button value", () => {
      expect(isRadioButtonValid("recently_filed")).toBeTruthy();
    });

    it("Should return true for undefined radio button value", () => {
      expect(isRadioButtonValid(undefined as unknown as string)).toBeTruthy();
    });

    it("Should return false for radio button value that is not valid", () => {
      expect(isRadioButtonValid("malicious code block")).toBeFalsy();
    });
  });
});
