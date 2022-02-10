import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  ConfirmationStatementService, Shareholder,
  StatementOfCapital
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getShareholders } from "./shareholder.service";

export const getStatementOfCapitalData = async (session: Session, transactionId: string, submissionId: string): Promise<StatementOfCapital> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<StatementOfCapital> | ApiErrorResponse = await csService.getStatementOfCapital(transactionId, submissionId);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error("Error retrieving statement of capital " + JSON.stringify(errorResponse));
  }
  const successfulResponse = response as Resource<StatementOfCapital>;
  return successfulResponse.resource as StatementOfCapital;
};

export const validateTotalNumberOfShares = async (session: Session, transactionId: string, submissionId: string, totalNumberOfShares: number): Promise<boolean> => {
  const shareholders: Shareholder[] = await getShareholders(session, transactionId, submissionId);
  let shareholderTotalNumberOfShares: number = 0;
  shareholders.forEach(shareholder => shareholderTotalNumberOfShares = +shareholder.shares + shareholderTotalNumberOfShares);
  return totalNumberOfShares === shareholderTotalNumberOfShares;
};
