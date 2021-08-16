import { createPrivateOAuthApiClient } from "./api.service";
import { ConfirmationStatementService, Shareholder } from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

export const getShareholders = async (session: Session, companyNumber: string): Promise<Shareholder[]> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<Shareholder> | ApiErrorResponse = await csService.getShareholders(companyNumber);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error("Error retrieving statement of capital " + JSON.stringify(errorResponse));
  }
  const successfulResponse = response as Resource<Shareholder[]>;
  return successfulResponse.resource as Shareholder[];
};
