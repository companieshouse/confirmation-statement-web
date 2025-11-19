/**
 * Gets an environment variable. If the env var is not set and a default value is not
 * provided, then it is assumed it is a mandatory requirement and an error will be
 * thrown.
 */

const getEnvironmentVariable = (key: string, defaultValue?: any): string => {
  const isMandatory = !defaultValue;
  const value: string = process.env[key] || "";

  if (!value && isMandatory) {
    throw new Error(`Please set the environment variable "${key}"`);
  }

  return value || defaultValue as string;
};

export const ACCOUNT_URL = getEnvironmentVariable("ACCOUNT_URL");

export const COOKIE_NAME = getEnvironmentVariable("COOKIE_NAME");

export const COOKIE_DOMAIN = getEnvironmentVariable("COOKIE_DOMAIN");

export const COOKIE_SECRET = getEnvironmentVariable("COOKIE_SECRET");

export const CACHE_SERVER = getEnvironmentVariable("CACHE_SERVER");

export const SHOW_SERVICE_OFFLINE_PAGE = getEnvironmentVariable("SHOW_SERVICE_OFFLINE_PAGE");

export const CHS_API_KEY = getEnvironmentVariable("CHS_API_KEY");

export const CHS_INTERNAL_API_KEY = getEnvironmentVariable("CHS_INTERNAL_API_KEY");

export const CHS_URL = getEnvironmentVariable("CHS_URL");

export const API_URL = getEnvironmentVariable("API_URL");

export const INTERNAL_API_URL = getEnvironmentVariable("INTERNAL_API_URL");

export const FEATURE_FLAG_SERVICE_WITHDRAWN_02102025 = getEnvironmentVariable("FEATURE_FLAG_SERVICE_WITHDRAWN_02102025", "false");

export const FEATURE_FLAG_PRIVATE_SDK_12052021 = getEnvironmentVariable("FEATURE_FLAG_PRIVATE_SDK_12052021");

export const FEATURE_FLAG_ECCT_START_DATE_14082023 = getEnvironmentVariable("FEATURE_FLAG_ECCT_START_DATE_14082023", "9999-12-31");

export const FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 = getEnvironmentVariable("FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021");

export const FEATURE_FLAG_LP_SUBTYPE_START_DATE = getEnvironmentVariable("FEATURE_FLAG_LP_SUBTYPE_START_DATE", "2025-01-01");

export const FEATURE_FLAG_SLP_SUBTYPE_START_DATE = getEnvironmentVariable("FEATURE_FLAG_SLP_SUBTYPE_START_DATE", "2025-01-03");

export const FEATURE_FLAG_PFLP_SUBTYPE_START_DATE = getEnvironmentVariable("FEATURE_FLAG_PFLP_SUBTYPE_START_DATE", "2025-01-05");

export const FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE = getEnvironmentVariable("FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE", "2025-01-07");

export const FEATURE_FLAG_SAIL_ADDRESS = getEnvironmentVariable("FEATURE_FLAG_SAIL_ADDRESS", "2025-01-09");

export const PIWIK_START_GOAL_ID = getEnvironmentVariable("PIWIK_START_GOAL_ID");

export const PSC_STATEMENTS_API_PAGE_SIZE = getEnvironmentVariable("PSC_STATEMENTS_API_PAGE_SIZE", "100");

export const URL_LOG_MAX_LENGTH: number = parseInt(getEnvironmentVariable("URL_LOG_MAX_LENGTH", "400"), 10);

export const URL_PARAM_MAX_LENGTH: number = parseInt(getEnvironmentVariable("URL_PARAM_MAX_LENGTH", "50"), 10);

export const RADIO_BUTTON_VALUE_LOG_LENGTH = parseInt(getEnvironmentVariable("RADIO_BUTTON_VALUE_LOG_LENGTH", "50"), 10);

export const EWF_URL = getEnvironmentVariable("EWF_URL");

export const LOCALES_ENABLED = getEnvironmentVariable("LOCALES_ENABLED", "true");

export const LOCALES_PATH = getEnvironmentVariable("LOCALES_PATH", "locales");

export const CS01_COST = getEnvironmentVariable("CS01_COST");

export const CS01_PAPER_FEE = getEnvironmentVariable("CS01_PAPER_FEE");
