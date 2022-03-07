import { logger } from "../utils/logger";

const COMPANY_NUMBER_MATCHER: RegExp = /^(?:[a-z]|[a-z][a-z])?\d{6,8}?$/i;

export const isCompanyNumberValid = (companyNumber: string): boolean => {
  logger.debug("Checking company number is valid");

  if (!companyNumber) {
    logger.error("No company number supplied");
    return false;
  }

  if (companyNumber.length !== 8) {
    logger.error("Invalid company number length");
    return false;
  }

  if (!COMPANY_NUMBER_MATCHER.test(companyNumber)) {
    logger.error("Invalid company number format");
    return false;
  }

  return true;
};
