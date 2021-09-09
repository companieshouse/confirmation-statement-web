

jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");
jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import {
  CompanyValidationResponse,
  ConfirmationStatementService, EligibilityStatusCode
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { checkEligibility } from "../../src/services/eligibility.service";
import { getSessionRequest } from "../mocks/session.mock";

const mockGetEligibility
    = ConfirmationStatementService.prototype.getEligibility as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;

mockCreateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

describe("Test eligibility checks", () => {

  const companyNumber = "11111111";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call sdk for eligibility check", async () => {
    const companyValidationResponse: CompanyValidationResponse = {
      eligibilityStatusCode: EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE
    };
    const resource: Resource<CompanyValidationResponse> = {
      httpStatusCode: 200,
      resource: companyValidationResponse
    };
    mockGetEligibility.mockResolvedValueOnce(resource);
    const response = await checkEligibility(getSessionRequest({ access_token: "token" }), companyNumber);
    expect(mockGetEligibility).toBeCalledWith(companyNumber);
    expect(response).toEqual(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
  });

});


