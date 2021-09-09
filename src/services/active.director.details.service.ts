import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveDirectorDetails } from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPublicOAuthApiClient } from "./api.service";
import { ConfirmationStatementService } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const getActiveDirectorDetailsData = async (session: Session, companyNumber: string): Promise<ActiveDirectorDetails> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<ActiveDirectorDetails> | ApiErrorResponse = await csService.getActiveDirectorDetails(companyNumber);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error(`Error retrieving active director details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<ActiveDirectorDetails>;
  return successfulResponse.resource as ActiveDirectorDetails;
};
