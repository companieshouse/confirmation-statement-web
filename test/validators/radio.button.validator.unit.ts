import {
  getRadioButtonInvalidValueErrorMessage,
  isRadioButtonValueValid
} from "../../src/validators/radio.button.validator";

const INVALID_RADIO_VALUE: string = "malicious code block";
const INVALID_RADIO_VALUE_LONG: string = "very malicious code block that is extremely long and dangerous";
const EXPECTED_ERROR_MESSAGE: string = "Radio value: malicious code block doesn't match the valid radio values";
const EXPECTED_ERROR_MESSAGE_LONG: string = "Radio value: very malicious code block that is extremely long a doesn't match the valid radio values";
const EXPECTED_ERROR_MESSAGE_NULL: string = "Radio value: undefined doesn't match the valid radio values";

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
      expect(isRadioButtonValueValid(INVALID_RADIO_VALUE)).toBeFalsy();
    });
  });

  describe("getRadioButtonInvalidValueErrorMessage tests", () => {

    it("Should return the radio value in the produced error message", () => {
      expect(getRadioButtonInvalidValueErrorMessage(INVALID_RADIO_VALUE)).toEqual(EXPECTED_ERROR_MESSAGE);
    });

    it("Should return no more than 50 characters for the truncated radio value in the error message", () => {
      expect(getRadioButtonInvalidValueErrorMessage(INVALID_RADIO_VALUE_LONG)).toEqual(EXPECTED_ERROR_MESSAGE_LONG);
    });

    it("Should return undefined in the error message when radio value is undefined", () => {
      expect(getRadioButtonInvalidValueErrorMessage(undefined as unknown as string)).toEqual(EXPECTED_ERROR_MESSAGE_NULL);
    });
  });
});
