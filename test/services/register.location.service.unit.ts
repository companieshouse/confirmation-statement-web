jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import {
  ConfirmationStatementService, RegisterLocation
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { Resource } from "@companieshouse/api-sdk-node";
import { getRegisterLocationData } from "../../src/services/register.location.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { mockRegisterLocation } from "../mocks/register.location.mock";

const mockGetRegisterLocations = ConfirmationStatementService.prototype.getRegisterLocations as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

describe("Test shareholder service", () => {

  const companyNumber = "11111111";

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
    const response = await getRegisterLocationData(session, companyNumber);
    expect(mockGetRegisterLocations).toBeCalledWith(companyNumber);
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
      await getRegisterLocationData(session, companyNumber);
    } catch (e) {
      actualMessage = e.message;
    }
    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
