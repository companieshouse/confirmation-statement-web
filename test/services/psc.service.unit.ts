jest.mock("@companieshouse/api-sdk-node");
jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import { CompanyPersonsWithSignificantControlStatements } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements";
import {
  ConfirmationStatementService,
  PersonOfSignificantControl,
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  mockCompanyPscStatementResource,
  mockPersonsOfSignificantControl
} from "../mocks/person.of.significant.control.mock";
import { getPscs, getPscStatement } from "../../src/services/psc.service";

const mockGetPersonsOfSignificantControl = ConfirmationStatementService.prototype.getPersonsOfSignificantControl as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyPscStatements = jest.fn();
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

mockCreateApiClient.mockReturnValue({
  companyPscStatements: {
    getCompanyPscStatements: mockGetCompanyPscStatements
  }
});

describe("Test psc service", () => {

  const companyNumber = "11111111";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call sdk to get psc data", async () => {
    const resource: Resource<PersonOfSignificantControl[]> = {
      httpStatusCode: 200,
      resource: mockPersonsOfSignificantControl
    };
    mockGetPersonsOfSignificantControl.mockResolvedValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getPscs(session, companyNumber);
    expect(mockGetPersonsOfSignificantControl).toBeCalledWith(companyNumber);
    expect(response).toEqual(mockPersonsOfSignificantControl);
  });

  it("should throw error when http error code is returned", async () => {
    const errorMessage = "Oh no this has failed";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };
    mockGetPersonsOfSignificantControl.mockResolvedValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving pscs from confirmation-statement-api " + JSON.stringify(errorResponse);
    let actualMessage: any;
    try {
      await getPscs(session, companyNumber);
    } catch (e) {
      actualMessage = e.message;
    }
    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });

  it("should call sdk to get psc statements", async () => {
    const resource: Resource<CompanyPersonsWithSignificantControlStatements> = {
      httpStatusCode: 200,
      resource: mockCompanyPscStatementResource
    };

    mockGetCompanyPscStatements.mockResolvedValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getPscStatement(session, companyNumber, 25, 0);
    expect(mockGetCompanyPscStatements).toBeCalledWith(companyNumber, 25, 0);
    expect(response).toEqual(mockCompanyPscStatementResource);
  });
});
