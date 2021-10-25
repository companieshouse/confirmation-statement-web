import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import { createAndLogError } from "../utils/logger";
import {
  ConfirmationStatementService,
  RegisterLocation
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const getRegisterLocationData = async (session: Session, transactionId: string, submissionId: string): Promise<RegisterLocation[]> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<RegisterLocation[]> | ApiErrorResponse = await csService.getRegisterLocations(transactionId, submissionId);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw createAndLogError(`Error retrieving register location data from confirmation-statment api: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<RegisterLocation[]>;
  return successfulResponse.resource as RegisterLocation[];
};
