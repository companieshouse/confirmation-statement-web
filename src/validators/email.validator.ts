const EMAIL_ADDRESS_MATCHER: RegExp = /^.+[@].+[.].+$/i;

export const isEmailAddressValid = (emailAddress: string): boolean => {

  if (!EMAIL_ADDRESS_MATCHER.test(emailAddress)) {
    return false;
  }

  return true;
};
