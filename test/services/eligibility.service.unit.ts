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

  it("Should throw an error if eligibility check returns status code 500", () => {
    const EXPECTED_ERROR_500 = "Error retrieving eligibility data from confirmation-statment api: {\"httpStatusCode\":500}";
    const resource: Resource<CompanyValidationResponse> = {
      httpStatusCode: 500,
    };
    mockGetEligibility.mockResolvedValueOnce(resource);
    expect(async () => {
      await checkEligibility(getSessionRequest({ access_token: "token" }), companyNumber);
    }).rejects.toThrow(EXPECTED_ERROR_500);
  });

  it("Should throw an error if eligibility check returns status code 401", () => {
    const EXPECTED_ERROR_401 = "Error retrieving eligibility data from confirmation-statment api: {\"httpStatusCode\":401}";
    const resource: Resource<CompanyValidationResponse> = {
      httpStatusCode: 401,
    };
    mockGetEligibility.mockResolvedValueOnce(resource);
    expect(async () => {
      await checkEligibility(getSessionRequest({ access_token: "token" }), companyNumber);
    }).rejects.toThrow(EXPECTED_ERROR_401);
  });

});
