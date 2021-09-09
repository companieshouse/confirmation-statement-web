import { createPublicOAuthApiClient } from "./api.service";
import { Shareholder } from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { ConfirmationStatementService } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const getShareholders = async (session: Session, companyNumber: string): Promise<Shareholder[]> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<Shareholder> | ApiErrorResponse = await csService.getShareholders(companyNumber);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    throw new Error("Error retrieving shareholder " + JSON.stringify(response));
  }
  const successfulResponse = response as Resource<Shareholder[]>;
  return successfulResponse.resource as Shareholder[];
};
