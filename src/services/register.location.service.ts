import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { RegisterLocation } from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPublicOAuthApiClient } from "./api.service";
import { createAndLogError } from "../utils/logger";
import { ConfirmationStatementService } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const getRegisterLocationData = async (session: Session, companyNumber: string): Promise<RegisterLocation[]> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<RegisterLocation[]> | ApiErrorResponse = await csService.getRegisterLocations(companyNumber);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw createAndLogError(`Error retrieving register location data from confirmation-statment api: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<RegisterLocation[]>;
  return successfulResponse.resource as RegisterLocation[];
};
