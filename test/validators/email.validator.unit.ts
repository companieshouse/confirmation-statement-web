import { isEmailAddressValid } from "../../src/validators/email.validator";

describe('Email validation', () => {
  it.each([
    ["name@example.com", true],
    ["MY-EMAIL@DOMAIN.CO.UK", true],
    ["MY_EMAIL@DOMAIN.CO.UK", true],
    ["MY3M4IL@DOMAIN.COM", true],
    ["χρήστης@παράδειγμα.ελ", true],
    ["Dörte@Sörensen.example.com", true],
    ["me@i.ai", true],
    ["dot.dot.dot@dot.dot.dot.dot.dot", true],
    ["", false],
    ["notanemail", false],
    ["!@!.!", false],
    ["MYEMAIL@DOMAIN.CO.UK.", false],
    [".MYEMAIL@DOMAIN.CO.UK", false],
    ["MYEMAIL@DOMAIN@DOMAIN.CO.UK", false],
    ["MYEMAIL.@DOMAIN.CO.UK", false],
    [".MYEMAIL@.DOMAIN.COM", false],
    ["MYEMAIL@DOMAIN.CO..UK", false],
    ["me@?i.ai", false],
    ["me@i.i", false],
    ["me@-i.i", false]
  ])('For email %p, validation should return %p', (email: string, result: boolean) => {
    expect(isEmailAddressValid(email)).toEqual(result);
  });
});
