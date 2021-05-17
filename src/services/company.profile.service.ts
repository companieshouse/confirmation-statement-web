import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile, ConfirmationStatement } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CHS_API_KEY } from "../utils/properties";
import { logger, createAndLogError } from "../utils/logger";
import { lookupCompanyStatus, lookupCompanyType } from "../utils/api.enumerations";
import { readableFormat } from "../utils/date.formatter";

export const getCompanyProfile = async (companyNumber: string): Promise<CompanyProfile> => {
  const apiClient = createApiClient(CHS_API_KEY);

  logger.debug(`Looking for company profile with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyProfile> = await apiClient.companyProfile.getCompanyProfile(companyNumber);

  if (!sdkResponse) {
    throw createAndLogError(`Company Profile API returned no response for company number ${companyNumber}`);
  }

  if (sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError(`Company Profile API returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received company profile ${JSON.stringify(sdkResponse)}`);

  return transform(sdkResponse.resource);
};

const transform = (companyProfile: CompanyProfile): CompanyProfile => {
  companyProfile.type = lookupCompanyType(companyProfile.type);
  companyProfile.companyStatus = lookupCompanyStatus(companyProfile.companyStatus);
  companyProfile.dateOfCreation = readableFormat(companyProfile.dateOfCreation);

  if (companyProfile.confirmationStatement) {
    const confirmationStatement: ConfirmationStatement = companyProfile.confirmationStatement;
    confirmationStatement.nextDue = readableFormat(confirmationStatement.nextDue);
    confirmationStatement.lastMadeUpTo = confirmationStatement.lastMadeUpTo ? readableFormat(confirmationStatement.lastMadeUpTo) : "";
  }
  return companyProfile;
};
