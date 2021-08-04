jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import {
  ConfirmationStatementService,
  PersonOfSignificantControl,
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { Resource } from "@companieshouse/api-sdk-node";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { mockPersonsOfSignificantControl } from "../mocks/person.of.significant.control.mock";
import { getPscs } from "../../src/services/psc.service";

const mockGetPersonsOfSignificantControl = ConfirmationStatementService.prototype.getPersonsOfSignificantControl as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

describe("Test statement of capital service", () => {

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
});
