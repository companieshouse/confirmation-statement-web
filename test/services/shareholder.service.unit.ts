jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import {
  ConfirmationStatementService, Shareholder
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { Resource } from "@companieshouse/api-sdk-node";
import { getShareholders } from "../../src/services/shareholder.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { mockShareholder } from "../mocks/shareholder.mock";

const mockGetShareholder = ConfirmationStatementService.prototype.getShareholders as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

describe("Test shareholder service", () => {

  const companyNumber = "11111111";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call sdk to get shareholder data", async () => {
    const resource: Resource<Shareholder[]> = {
      httpStatusCode: 200,
      resource: mockShareholder
    };
    mockGetShareholder.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getShareholders(session, companyNumber);
    expect(mockGetShareholder).toBeCalledWith(companyNumber);
    expect(response).toEqual(mockShareholder);
  });

  it("should throw error when http error code is returned", async () => {
    const errorMessage = "Something isn't right";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };
    mockGetShareholder.mockResolvedValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving shareholder " + JSON.stringify(errorResponse);
    let actualMessage;
    try {
      await getShareholders(session, companyNumber);
    } catch (e) {
      actualMessage = e.message;
    }
    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});