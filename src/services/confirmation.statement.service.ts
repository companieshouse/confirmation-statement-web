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
    throw new Error(`Something went wrong creating confirmation statement ${JSON.stringify(castedResponse)}`);
  } else {
    return response as Resource<ConfirmationStatementCreated | CompanyValidationResponse>;
  }
};

export const updateConfirmationStatement = async (session: Session,
                                                  transactionId: string,
                                                  confirmationStatementId: string,
                                                  csSubmission: ConfirmationStatementSubmission): Promise<any> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  return await csService.postUpdateConfirmationStatement(transactionId, confirmationStatementId, csSubmission);
};
