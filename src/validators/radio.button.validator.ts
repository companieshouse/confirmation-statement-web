import { logger } from "../utils/logger";
import { RADIO_BUTTON_VALUE, RADIO_BUTTON_VALUE_LOG_LENGTH } from "../utils/constants";

export const isRadioButtonValueValid = (radioValue: string): boolean => {
  logger.debug("Checking radio button is valid");

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

  return false;
};

export const getRadioButtonInvalidValueErrorMessage = (radioValue: string): string => {
  const truncatedRadioValue = radioValue.substring(0, RADIO_BUTTON_VALUE_LOG_LENGTH);
  return `Radio value: ${truncatedRadioValue} doesn't match the valid radio values`;
};
