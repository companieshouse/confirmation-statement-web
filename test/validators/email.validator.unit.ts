import { isEmailAddressValid } from "../../src/validators/email.validator";

describe('Email validation', () => {
  it.each([
    ["name@example.com", true],
    ["notanemail", false],
    ["", false],
  ])('For email %p, validation should return %p', (email: string, result: boolean) => {
    expect(isEmailAddressValid(email)).toEqual(result);
  });
});
