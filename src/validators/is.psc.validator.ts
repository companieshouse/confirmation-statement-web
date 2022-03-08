import { logger } from "../utils/logger";

export const isPscFlagValid = (isPsc: string): boolean => {
  logger.debug("Checking isPsc value is valid");

  if (isPsc !== 'false' && isPsc !== 'true') {
    return false;
  }

  return true;
};
