jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import {
  ConfirmationStatementService, Shareholder
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { Resource } from "@companieshouse/api-sdk-node";
import { getShareholders } from "../../src/services/shareholder.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { mockShareholder } from "../mocks/shareholder.mock";

const mockGetShareholder = ConfirmationStatementService.prototype.getShareholders as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;

mockCreateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

describe("Test shareholder service", () => {

  const TRANSACTION_ID = "66454";
  const SUBMISSION_ID = "435435";

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
    const response = await getShareholders(session, TRANSACTION_ID, SUBMISSION_ID);
    expect(mockGetShareholder).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
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
      await getShareholders(session, TRANSACTION_ID, SUBMISSION_ID);
    } catch (e) {
      actualMessage = e.message;
    }
    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
