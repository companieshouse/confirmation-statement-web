import { Session } from "@companieshouse/node-session-handler";
import { ConfirmationStatementService } from "private-api-sdk-node/dist/services/confirmation-statement";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { createOAuthApiClient } from "./api/api.service";

export const createConfirmationStatement = async (session: Session,
                                                  transactionId: string): Promise<Resource<any>> => {
  const client = createOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  return await csService.postNewConfirmationStatement(transactionId);
};
