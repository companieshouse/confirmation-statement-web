import { isRadioButtonValueValid } from "../../src/validators/radio.button.validator";

describe("radio button validator tests", () => {

  describe("isRadioButtonValid tests", () => {

    it("Should return true for a yes radio button value", () => {
      expect(isRadioButtonValueValid("yes")).toBeTruthy();
    });

    it("Should return true for a no radio button value", () => {
      expect(isRadioButtonValueValid("no")).toBeTruthy();
    });

    it("Should return true for a recently_filed radio button value", () => {
      expect(isRadioButtonValueValid("recently_filed")).toBeTruthy();
    });

    it("Should return true for undefined radio button value", () => {
      expect(isRadioButtonValueValid(undefined as unknown as string)).toBeTruthy();
    });

    it("Should return false for radio button value that is not valid", () => {
      expect(isRadioButtonValueValid("malicious code block")).toBeFalsy();
    });
  });
});
