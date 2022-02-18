import { logger } from "../utils/logger";

export const isRadioButtonValid = (radioId: string): boolean => {

  logger.debug("Check radio button is valid");

  if (!radioId) {
    logger.debug("No radio button id supplied");
    return true;
  }

  const validRadioIds: string[] = ["yes", "no", "recently_filed"];

  for (const value of validRadioIds) {
    if (radioId === value) {
      return true;
    }
  }

  const truncatedRadioIdValue = radioId.substring(0, 14);

  logger.error(`Radio id: ${truncatedRadioIdValue} doesn't match the valid radio ids`);
  return false;
};
