import { Session } from "@companieshouse/node-session-handler";
import {
  CompanyValidationResponse,
  ConfirmationStatementCreated,
  ConfirmationStatementService
} from "private-api-sdk-node/dist/services/confirmation-statement";
import Resource, {ApiErrorResponse} from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPrivateOAuthApiClient } from "./api.service";

export const createConfirmationStatement = async (session: Session,
                                                  transactionId: string): Promise<Resource<ConfirmationStatementCreated | CompanyValidationResponse>> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.postNewConfirmationStatement(transactionId);
  if (response.httpStatusCode != (201 || 400)) {
    const castedResponse: ApiErrorResponse = response;
    throw new Error("Something went wrong creating confirmation statement " + JSON.stringify(castedResponse))
  } else {
    return response as Resource<ConfirmationStatementCreated | CompanyValidationResponse>
  }
};

