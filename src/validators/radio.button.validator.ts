import { logger } from "../utils/logger";
import { RADIO_BUTTON_VALUE } from "../utils/constants";

export const isRadioButtonValueValid = (radioValue: string): boolean => {

  logger.debug("Check radio button is valid");

  if (!radioValue) {
    logger.debug("No radio button value supplied");
    return true;
  }

  const validRadioValues: string[] = [RADIO_BUTTON_VALUE.YES, RADIO_BUTTON_VALUE.NO, RADIO_BUTTON_VALUE.RECENTLY_FILED];

  for (const value of validRadioValues) {
    if (radioValue === value) {
      return true;
    }
  }

  const truncatedRadioValue = radioValue.substring(0, 14);

  logger.error(`Radio value: ${truncatedRadioValue} doesn't match the valid radio values`);
  return false;
};
