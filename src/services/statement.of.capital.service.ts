import { createOAuthApiClient } from "./api.service";
import { ConfirmationStatementService, StatementOfCapital } from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiError, ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

export const getStatementOfCapitalData = async (session: Session, companyNumber: string): Promise<StatementOfCapital> => {
  const client = createOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<StatementOfCapital> | ApiErrorResponse = await csService.getStatementOfCapital(companyNumber);
  if (response.httpStatusCode === 404) {
    const errorResponse = response as ApiErrorResponse;
    const apiErrors = errorResponse.errors as ApiError[];
    throw new Error("Error retrieving statement of capital " + apiErrors[0].error);
  }
  const successfulResponse = response as Resource<StatementOfCapital>;
  return successfulResponse.resource as StatementOfCapital;
};
