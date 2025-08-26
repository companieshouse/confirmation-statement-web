import { FEATURE_FLAG_ECCT_START_DATE_14082023,
  FEATURE_FLAG_LP_SUBTYPE_START_DATE,
  FEATURE_FLAG_SLP_SUBTYPE_START_DATE,
  FEATURE_FLAG_PFLP_SUBTYPE_START_DATE,
  FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE } from "./properties";
import { isValidDate } from "./date";
import { logger } from "./logger";

/**
 * Feature flags will be determined by environment variables and all environment variables in nodejs are
 * either string or undefined. This function will ensure that 'false', '0', 'off' etc remain falsy
 */
export const isActiveFeature = (flag: string | undefined): boolean => {
  if (flag === undefined) {
    return false;
  }
  const featureFlag = flag.toLowerCase();
  return !(featureFlag === "false" ||
          featureFlag === "0" ||
          featureFlag === "off" ||
          featureFlag === "");

};

export const isDateFeatureFlagEnabled = (featureFlagKey: string, featureFlagDateString: string, dateToCompare: Date): boolean => {

  if (!isValidDate(featureFlagDateString)) {
    logger.info(`Environment Variable "${featureFlagKey}" must be in yyyy-mm-dd format`);
    return false;
  }

  const featureFlagStartDate: Date = new Date(featureFlagDateString);

  return dateToCompare >= featureFlagStartDate;
};

export const ecctDayOneEnabled = (dateToCompare: Date): boolean => {
  return isDateFeatureFlagEnabled("FEATURE_FLAG_ECCT_START_DATE_14082023", FEATURE_FLAG_ECCT_START_DATE_14082023, dateToCompare);
};

export const isLimitedPartnershipFeatureEnabled = (): boolean => {
  return isDateFeatureFlagEnabled("FEATURE_FLAG_LP_SUBTYPE_START_DATE", FEATURE_FLAG_LP_SUBTYPE_START_DATE, new Date());
};

export const isScottishLimitedPartnershipFeatureEnabled = (): boolean => {
  return isDateFeatureFlagEnabled("FEATURE_FLAG_SLP_SUBTYPE_START_DATE", FEATURE_FLAG_SLP_SUBTYPE_START_DATE, new Date());
};

export const isPrivateFundLimitedPartnershipFeatureEnabled = (): boolean => {
  return isDateFeatureFlagEnabled("FEATURE_FLAG_PFLP_SUBTYPE_START_DATE", FEATURE_FLAG_PFLP_SUBTYPE_START_DATE, new Date());
};

export const isScottishPrivateFundimitedPartnershipFeatureEnabled = (): boolean => {
  return isDateFeatureFlagEnabled("FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE", FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE, new Date());
};
