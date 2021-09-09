jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import {
  ConfirmationStatementService,
  StatementOfCapital
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { Resource } from "@companieshouse/api-sdk-node";
import { getStatementOfCapitalData } from "../../src/services/statement.of.capital.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { mockStatementOfCapital } from "../mocks/confirmation.statement.submission.mock";

const mockGetStatementOfCapital = ConfirmationStatementService.prototype.getStatementOfCapital as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;

mockCreateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

describe("Test statement of capital service", () => {

  const companyNumber = "11111111";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call sdk to get statement of capital data", async () => {
    const resource: Resource<StatementOfCapital> = {
      httpStatusCode: 200,
      resource: mockStatementOfCapital
    };
    mockGetStatementOfCapital.mockResolvedValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getStatementOfCapitalData(session, companyNumber);
    expect(mockGetStatementOfCapital).toBeCalledWith(companyNumber);
    expect(response).toEqual(mockStatementOfCapital);
  });

  it("should throw error when http error code is returned", async () => {
    const errorMessage = "Oh no this has failed";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };
    mockGetStatementOfCapital.mockResolvedValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving statement of capital " + JSON.stringify(errorResponse);
    let actualMessage;
    try {
      await getStatementOfCapitalData(session, companyNumber);
    } catch (e) {
      actualMessage = e.message;
    }
    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
