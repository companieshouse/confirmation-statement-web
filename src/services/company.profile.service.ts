import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CHS_API_KEY } from "../utils/properties";
import logger from "../utils/logger";

export const getCompanyProfile = async (companyNumber: string): Promise<CompanyProfile> => {
  const apiClient = createApiClient(CHS_API_KEY);

  logger.debug(`Looking for company profile with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyProfile> = await apiClient.companyProfile.getCompanyProfile(companyNumber);

  if (!sdkResponse) {
    return logAndThrowError(new Error (`Company Profile API returned no response for company number ${companyNumber}`));
  }

  if (sdkResponse.httpStatusCode >= 400) {
    return logAndThrowError(new Error (`Http status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`));
  }

  if (!sdkResponse.resource) {
    return logAndThrowError(new Error (`Company Profile API returned no resource for company number ${companyNumber}`));
  }

  logger.debug(`Received company profile ${sdkResponse}`);

  return sdkResponse.resource;
};

const logAndThrowError = (error: Error) => {
  logger.error(`${error.message} - ${error.stack}`);
  throw error;
};
