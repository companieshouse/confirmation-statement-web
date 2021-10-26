jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import {
  ConfirmationStatementService, RegisterLocation
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { Resource } from "@companieshouse/api-sdk-node";
import { getRegisterLocationData } from "../../src/services/register.location.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { mockRegisterLocation } from "../mocks/register.location.mock";

const mockGetRegisterLocations = ConfirmationStatementService.prototype.getRegisterLocations as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;

mockCreateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

describe("Test register location service", () => {

  const TRANSACTION_ID = "66544";
  const SUBMISSION_ID = "6464647";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call sdk to get register location data", async () => {
    const resource: Resource<RegisterLocation[]> = {
      httpStatusCode: 200,
      resource: mockRegisterLocation
    };
    mockGetRegisterLocations.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getRegisterLocationData(session, TRANSACTION_ID, SUBMISSION_ID);
    expect(mockGetRegisterLocations).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
    expect(response).toEqual(mockRegisterLocation);
  });

  it("should throw error when http error code is returned", async () => {
    const errorMessage = "Something isn't right";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };
    mockGetRegisterLocations.mockResolvedValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving register location data from confirmation-statment api: " + JSON.stringify(errorResponse);
    let actualMessage;
    try {
      await getRegisterLocationData(session, TRANSACTION_ID, SUBMISSION_ID);
    } catch (e) {
      actualMessage = e.message;
    }
    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
