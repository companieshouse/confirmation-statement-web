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

export const COOKIE_NAME = getEnvironmentVariable("COOKIE_NAME");

export const COOKIE_DOMAIN = getEnvironmentVariable("COOKIE_DOMAIN");

export const COOKIE_SECRET = getEnvironmentVariable("COOKIE_SECRET");

export const CACHE_SERVER = getEnvironmentVariable("CACHE_SERVER");

export const SHOW_SERVICE_OFFLINE_PAGE = getEnvironmentVariable("SHOW_SERVICE_OFFLINE_PAGE");
