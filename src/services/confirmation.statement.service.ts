import { Session } from "@companieshouse/node-session-handler";
import {
  ConfirmationStatementService,
  ConfirmationStatementSubmission
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateOAuthApiClient } from "./api.service";

export const createConfirmationStatement = async (session: Session,
                                                  transactionId: string): Promise<any> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  return await csService.postNewConfirmationStatement(transactionId);
};

export const updateConfirmationStatement = async (session: Session,
                                                  transactionId: string,
                                                  confirmationStatementId: string,
                                                  csSubmission: ConfirmationStatementSubmission): Promise<any> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  return await csService.postUpdateConfirmationStatement(transactionId, confirmationStatementId, csSubmission);
};
