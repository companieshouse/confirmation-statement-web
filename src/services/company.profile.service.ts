import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CHS_API_KEY } from "../utils/properties";
import logger from "../utils/logger";

export const getCompanyProfile = async (companyNumber: string): Promise<CompanyProfile> => {
  const apiClient = createApiClient(CHS_API_KEY);

  logger.debug(`Looking for company profile with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyProfile> = await apiClient.companyProfile.getCompanyProfile(companyNumber);

  if (sdkResponse.httpStatusCode >= 400) {
    const error = new Error (`Http status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`);
    logger.error(`${error.message} - ${error.stack}`);
    throw error;
  }

  if (sdkResponse.resource) {
    return sdkResponse.resource;
  } else {
    const error = new Error (`Company profile is undefined for company number ${companyNumber}`);
    logger.error(`${error.message} - ${error.stack}`);
    throw error;
  }
};
