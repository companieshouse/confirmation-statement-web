import { isEmailAddressValid } from "../../src/validators/email.validator";

describe('Email validation', () => {
  it.each([
    ["name@example.com", true],
    ["MY-EMAIL@DOMAIN.CO.UK", true],
    ["MY_EMAIL@DOMAIN.CO.UK", true],
    ["MY3M4IL@DOMAIN.COM", true],
    ["me@i.ai", true],
    ["dot.dot.dot@dot.dot.dot.dot.dot", true],
    [".MYEMAIL@DOMAIN.CO.UK", true],
    ["MYEMAIL.@DOMAIN.CO.UK", true],
    ["me@i.i", true],
    ["", false],
    ["notanemail", false],
    ["!@!.!", false],
    ["MYEMAIL@DOMAIN.CO.UK.", false],
    ["MYEMAIL@DOMAIN@DOMAIN.CO.UK", false],
    [".MYEMAIL@.DOMAIN.COM", false],
    ["MYEMAIL@DOMAIN.CO..UK", false],
    ["χρήστης@παράδειγμα.ελ", false],
    ["Dörte@Sörensen.example.com", false],
    ["me@?i.ai", false],
    ["me@-i.i", false],
    ["me@i", false],
    ["me@i,com", false]
  ])('For email %p, validation should return %p', (email: string, result: boolean) => {
    expect(isEmailAddressValid(email)).toEqual(result);
  });
});
