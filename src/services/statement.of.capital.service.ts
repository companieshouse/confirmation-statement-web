import { createOAuthApiClient } from "./api.service";
import { ConfirmationStatementService, StatementOfCapital
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";

export const getStatementOfCapitalData = async (session: Session, transactionId: string, companyNumber: string): Promise<StatementOfCapital> => {
  const client = createOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<StatementOfCapital> = await csService.getStatementOfCapital(transactionId, companyNumber);
  if (response.httpStatusCode === 200) {
    return response.resource as StatementOfCapital;
  }
  throw new Error("Statement of capital data not found");
};
