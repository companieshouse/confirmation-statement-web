const COMPANY_NUMBER_MATCHER: RegExp = /^(?:[a-z]|[a-z][a-z])?\d{6,8}?$/i;

export const isCompanyNumberValid = (companyNumber: string): boolean => {
  if (!companyNumber) {
    return false;
  }

  if (companyNumber.length !== 8) {
    return false;
  }

  return COMPANY_NUMBER_MATCHER.test(companyNumber);
};
