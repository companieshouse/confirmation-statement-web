import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { CHS_API_KEY } from "../utils/properties";
import { logger, createAndLogError } from "../utils/logger";

export const getCompanyOfficers = async (companyNumber: string): Promise<CompanyOfficers> => {
  const apiClient = createApiClient(CHS_API_KEY);

  logger.info(`Looking for company officers with company number ${companyNumber}`);

  const sdkResponse: Resource<CompanyOfficers> = await apiClient.companyOfficers.getCompanyOfficers(companyNumber);

  if (!sdkResponse) {
    throw createAndLogError(`Company Officers API returned no response for company number ${companyNumber}`);
  }

  if (sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company officers for company number ${companyNumber}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError(`Company Officers API returned no resource for company number ${companyNumber}`);
  }

  logger.info(`Received company officers for company number ${companyNumber} : ${JSON.stringify(sdkResponse)}`);

  return sdkResponse.resource;
};