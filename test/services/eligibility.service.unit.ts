jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import { Resource } from "@companieshouse/api-sdk-node";
import {
  CompanyValidationResponse,
  ConfirmationStatementService,
  EligibilityStatusCode
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { checkEligibility } from "../../src/services/eligibility.service";
import { getSessionRequest } from "../mocks/session.mock";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";

const mockGetEligibility
    = ConfirmationStatementService.prototype.getEligibility as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

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


