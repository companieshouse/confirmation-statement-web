import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  CompanyValidationResponse,
  ConfirmationStatementService,
  EligibilityStatusCode
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { createAndLogError } from "../utils/logger";

export const checkEligibility = async (session: Session, companyNumber: string): Promise<EligibilityStatusCode> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<CompanyValidationResponse> = await csService.getEligibility(companyNumber);
  const status = response.httpStatusCode;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw createAndLogError(`Error retrieving eligibility data from confirmation-statment api: ${JSON.stringify(errorResponse)}`);
  }
  const companyValidationResponse: CompanyValidationResponse = response.resource as CompanyValidationResponse;
  return companyValidationResponse.eligibilityStatusCode;
};
