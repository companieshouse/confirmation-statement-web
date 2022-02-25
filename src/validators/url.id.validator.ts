import { logger } from "../utils/logger";

const MAX_LENGTH = 50;

export const isUrlIdValid = (urlId: string): boolean => {
  logger.debug("Check the URL id is valid");

  if (!urlId) {
    logger.error("No URL id supplied");
    return false;
  }

  if (urlId.length > MAX_LENGTH) {
    const truncatedUrlId: string = urlId.substring(0, MAX_LENGTH);
    logger.info(`URL id exceeds ${MAX_LENGTH} characters - ${truncatedUrlId}...`);
    return false;
  }

  return true;
};
