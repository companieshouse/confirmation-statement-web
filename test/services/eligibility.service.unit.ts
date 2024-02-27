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
  const errorMessageTemplate = "Error retrieving eligibility data from confirmation-statment api: {\"httpStatusCode\":HTTP_STATUS_CODE}";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call sdk for eligibility check - happy path", async () => {
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

  it("Should pass through returned value if eligibility check is successful", async () => {
    const companyValidationResponse: CompanyValidationResponse = {
      eligibilityStatusCode: EligibilityStatusCode.INVALID_COMPANY_STATUS
    };
    const resource: Resource<CompanyValidationResponse> = {
      httpStatusCode: 200,
      resource: companyValidationResponse
    };
    mockGetEligibility.mockResolvedValueOnce(resource);
    const response = await checkEligibility(getSessionRequest({ access_token: "token" }), companyNumber);
    expect(mockGetEligibility).toBeCalledWith(companyNumber);
    expect(response).toEqual(EligibilityStatusCode.INVALID_COMPANY_STATUS);
  });

  test.each([400, 401, 404, 500])("Should throw an error if eligibility check returns error code %s", async (errorStatus) => {
    const EXPECTED_ERROR = errorMessageTemplate.replace("HTTP_STATUS_CODE",String(errorStatus));
    const resource: Resource<CompanyValidationResponse> = {
      httpStatusCode: errorStatus,
    };
    mockGetEligibility.mockResolvedValueOnce(resource);
    expect.hasAssertions(); // will fail if no error thrown & we never reach assertion in catch block
    try {
      await checkEligibility(getSessionRequest({ access_token: "token" }), companyNumber);
    } catch (error) {
      // using try-catch instead of expectThrows as it plays better with test.each
      expect(error.message).toBe(EXPECTED_ERROR);
    }
  });

});
