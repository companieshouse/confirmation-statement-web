import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails, ConfirmationStatementService } from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateOAuthApiClient } from "./api.service";

export const getActiveOfficerDetailsData = async (session: Session, companyNumber: string): Promise<ActiveOfficerDetails> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<ActiveOfficerDetails> | ApiErrorResponse = await csService.getActiveOfficerDetails(companyNumber);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error("Error retrieving active officer details: " + JSON.stringify(errorResponse));
  }
  const successfulResponse = response as Resource<ActiveOfficerDetails>;
  return successfulResponse.resource as ActiveOfficerDetails;
};
