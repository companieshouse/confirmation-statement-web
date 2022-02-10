jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");
jest.mock("../../src/services/shareholder.service");

import {
  ConfirmationStatementService,
  StatementOfCapital
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { Resource } from "@companieshouse/api-sdk-node";
import { getStatementOfCapitalData, validateTotalNumberOfShares } from "../../src/services/statement.of.capital.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { mockStatementOfCapital } from "../mocks/confirmation.statement.submission.mock";
import { getShareholders } from "../../src/services/shareholder.service";

const mockGetStatementOfCapital = ConfirmationStatementService.prototype.getStatementOfCapital as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetShareholders =  getShareholders as jest.Mock;

mockCreateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

describe("Test statement of capital service", () => {

  const TRANSACTION_ID = "66544";
  const SUBMISSION_ID = "6464647";

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
    const response = await getStatementOfCapitalData(session, TRANSACTION_ID, SUBMISSION_ID);
    expect(mockGetStatementOfCapital).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
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
      await getStatementOfCapitalData(session, TRANSACTION_ID, SUBMISSION_ID);
    } catch (e) {
      actualMessage = e.message;
    }
    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });

  it("should return true when share capital matches", async () => {
    mockGetShareholders.mockResolvedValue([{ shares: "100" }]);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await validateTotalNumberOfShares(session, TRANSACTION_ID, SUBMISSION_ID, 100);
    expect(response).toBe(true);
  });

  it("should return false when share capital mismatches", async () => {
    mockGetShareholders.mockResolvedValue([{ shares: "100" }]);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await validateTotalNumberOfShares(session, TRANSACTION_ID, SUBMISSION_ID, 1000);
    expect(response).toBe(false);
  });
});
