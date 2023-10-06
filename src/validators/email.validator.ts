const EMAIL_ADDRESS_MATCHER: RegExp = new RegExp("^(?=.+@)[\\p{L}\\p{N}\\p{M}_-]+(\\.[\\p{L}\\p{N}\\p{M}_-]+)*[@][\\p{L}\\p{N}\\p{M}_-]+(\\.[\\p{L}\\p{N}\\p{M}_-]+)*(\\.[\\p{L}\\p{N}\\p{M}_-]{2,})$","u");

export const isEmailAddressValid = (emailAddress: string): boolean => {

  if (!EMAIL_ADDRESS_MATCHER.test(emailAddress)) {
    return false;
  }

  return true;
};
