import { createPrivateOAuthApiClient } from "./api.service";
import { ConfirmationStatementService, StatementOfCapital } from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

export const getStatementOfCapitalData = async (session: Session, companyNumber: string): Promise<StatementOfCapital> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<StatementOfCapital> | ApiErrorResponse = await csService.getStatementOfCapital(companyNumber);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error("Error retrieving statement of capital " + JSON.stringify(errorResponse));
  }
  const successfulResponse = response as Resource<StatementOfCapital>;
  return successfulResponse.resource as StatementOfCapital;
};