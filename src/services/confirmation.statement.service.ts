import { Session } from "@companieshouse/node-session-handler";
import {
  CompanyValidationResponse,
  ConfirmationStatementCreated,
  ConfirmationStatementService,
  ConfirmationStatementSubmission
} from "private-api-sdk-node/dist/services/confirmation-statement";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPrivateOAuthApiClient } from "./api.service";

export const createConfirmationStatement = async (session: Session,
                                                  transactionId: string): Promise<Resource<ConfirmationStatementCreated | CompanyValidationResponse>> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.postNewConfirmationStatement(transactionId);
  if (response.httpStatusCode !== 201 && response.httpStatusCode !== 400) {
    const castedResponse: ApiErrorResponse = response;
    throw new Error(`Something went wrong creating confirmation statement, transactionId = ${transactionId} - ${JSON.stringify(castedResponse)}`);
  } else {
    return response as Resource<ConfirmationStatementCreated | CompanyValidationResponse>;
  }
};

export const getConfirmationStatement = async (session: Session, transactionId: string, confirmationStatementId: string): Promise<ConfirmationStatementSubmission> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.getConfirmationStatementSubmission(transactionId, confirmationStatementId);

  if (response.httpStatusCode !== 200) {
    throw new Error(`Error getting confirmation statement from api with confirmationStatementId = ${confirmationStatementId}, transactionId = ${transactionId} - ${JSON.stringify(response)}`);
  }

  const csSubmissionResource = response as Resource<ConfirmationStatementSubmission>;
  if (!csSubmissionResource.resource) {
    throw new Error(`Error No resource returned when getting confirmation statement from api with confirmationStatementId = ${confirmationStatementId}, transactionId = ${transactionId}`);
  }

  return csSubmissionResource.resource;
};

export const updateConfirmationStatement = async (session: Session,
                                                  transactionId: string,
                                                  submitId: string,
                                                  csSubmission: ConfirmationStatementSubmission) => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.postUpdateConfirmationStatement(transactionId, submitId, csSubmission);
  if (response.httpStatusCode !== 200) {
    const castedResponse: ApiErrorResponse = response;
    throw new Error(`Transaction Id ${transactionId}, Submit Id ${submitId}, Something went wrong updating confirmation statement ${JSON.stringify(castedResponse)}`);
  }
};
