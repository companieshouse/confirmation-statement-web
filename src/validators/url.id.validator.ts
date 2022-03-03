import { URL_PARAM_MAX_LENGTH } from "../utils/properties";
import { logger } from "../utils/logger";

export const isUrlIdValid = (urlId: string): boolean => {
  logger.debug("Check the URL id is valid");

  if (!urlId) {
    logger.error("No URL id supplied");
    return false;
  }

  if (urlId.length > URL_PARAM_MAX_LENGTH) {
    const truncatedUrlId: string = urlId.substring(0, URL_PARAM_MAX_LENGTH);
    logger.error(`URL id exceeds ${URL_PARAM_MAX_LENGTH} characters - ${truncatedUrlId}...`);
    return false;
  }

  return true;
};
