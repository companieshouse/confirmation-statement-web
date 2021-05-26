import {
  CompanyValidationResponse,
  ConfirmationStatementService, EligibilityStatusCode
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { createOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";

export const checkEligibility = async (session: Session, companyNumber: string): Promise<EligibilityStatusCode> => {
  const client = createOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<CompanyValidationResponse> = await csService.getEligiblity(companyNumber);
  const companyValidationResponse: CompanyValidationResponse = response.resource as CompanyValidationResponse;
  return companyValidationResponse.eligibilityStatusCode;
};
