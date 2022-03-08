const COMPANY_NUMBER_MATCHER: RegExp = /^[A-Za-z0-9]{8}$/i;

export const isCompanyNumberValid = (companyNumber: string): boolean => {
  if (!companyNumber) {
    return false;
  }

  return COMPANY_NUMBER_MATCHER.test(companyNumber);
};
