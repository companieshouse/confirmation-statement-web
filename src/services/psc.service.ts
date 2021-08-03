import { createPrivateOAuthApiClient } from "./api.service";
import { ConfirmationStatementService, PersonOfSignificantControl } from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

export const getPscs = async (session: Session, companyNumber: string): Promise<PersonOfSignificantControl[]> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<PersonOfSignificantControl[]> | ApiErrorResponse = await csService.getPersonsOfSignificantControl(companyNumber);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error("Error retrieving pscs from confirmation-statement-api " + JSON.stringify(errorResponse));
  }
  const successfulResponse = response as Resource<PersonOfSignificantControl[]>;
  return successfulResponse.resource as PersonOfSignificantControl[];
};
