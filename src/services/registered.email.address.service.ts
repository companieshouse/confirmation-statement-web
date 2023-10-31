import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import ConfirmationStatementService from "private-api-sdk-node/dist/services/confirmation-statement/service";
import { RegisteredEmailAddressResponse } from "private-api-sdk-node/dist/services/confirmation-statement/types";
import { createAndLogError } from "../utils/logger";
import { createPrivateApiKeyClient } from "./api.service";

export const getRegisteredEmailAddress = async (companyNumber: string): Promise<string> => {
  const client = createPrivateApiKeyClient();
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<RegisteredEmailAddressResponse> | ApiErrorResponse = await csService.getRegisteredEmailAddress(companyNumber);
  if (!response) {
    throw createAndLogError(`confirmation-statement-api returned no response for company number ${companyNumber}`);
  }
  const status = response.httpStatusCode as number;
  if (status !== 200) {
    const errorResponse = response as ApiErrorResponse;
    if (status === 404 && errorResponse.errors && errorResponse.errors[0].error === "Registered Email Address not found" ) {
      return ""; // using empty string to indicate not found - unambiguous as this is not an allowed value in CHIPS
    }
    throw createAndLogError(`Error retrieving registered email address from confirmation-statement api for company number ${companyNumber}: ${JSON.stringify(response)}`);
  }
  const successfulResponse = response as Resource<RegisteredEmailAddressResponse>;
  if (!successfulResponse.resource) {
    throw createAndLogError(`No resource in response for registered email address from confirmation-statement api for company number ${companyNumber}: : ${JSON.stringify(successfulResponse)}`);
  }
  return successfulResponse.resource.registered_email_address;
};

export const doesCompanyHaveEmailAddress = async (companyNumber: string): Promise<boolean> => {
  const emailAddress: string = await getRegisteredEmailAddress(companyNumber);
  return Boolean(emailAddress);
};
