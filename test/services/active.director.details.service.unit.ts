jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getActiveOfficerDetailsData } from "../../src/services/active.director.details.service";
import { mockActiveOfficerDetails, mockActiveOfficerDetailsFormatted } from "../mocks/active.director.details.mock";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { formatOfficerDetails } from "../../src/utils/format";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {
  ActiveOfficerDetails,
  ConfirmationStatementService
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const mockGetActiveOfficerDetails = ConfirmationStatementService.prototype.getActiveOfficerDetails as jest.Mock;
const mockCreatePrivateApiClient = createApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test active director details service", () => {

  const TRANSACTION_ID = "66454";
  const SUBMISSION_ID = "435435";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the active director details data", async () => {

    const resource: Resource<ActiveOfficerDetails> = {
      httpStatusCode: 200,
      resource: mockActiveOfficerDetails
    };

    mockGetActiveOfficerDetails.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getActiveOfficerDetailsData(session, TRANSACTION_ID, SUBMISSION_ID);

    expect(mockGetActiveOfficerDetails).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
    expect(response).toEqual(mockActiveOfficerDetails);

  });

  it("should throw error when http error code is returned", async () => {

    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetActiveOfficerDetails.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving active director details: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getActiveOfficerDetailsData(session, TRANSACTION_ID, SUBMISSION_ID);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);

  });

});

describe("Format director details test", () => {
  it ("should convert director details to presentible format ", () => {
    const formattedOfficerDetails: ActiveOfficerDetails = formatOfficerDetails(clone(mockActiveOfficerDetails));
    expect(formattedOfficerDetails.foreName1).toEqual(mockActiveOfficerDetailsFormatted.foreName1);
    expect(formattedOfficerDetails.foreName2).toEqual(mockActiveOfficerDetailsFormatted.foreName2);
    expect(formattedOfficerDetails.surname).toEqual(mockActiveOfficerDetailsFormatted.surname);
    expect(formattedOfficerDetails.nationality).toEqual(mockActiveOfficerDetailsFormatted.nationality);
    expect(formattedOfficerDetails.occupation).toEqual(mockActiveOfficerDetailsFormatted.occupation);
    expect(formattedOfficerDetails.serviceAddress).toEqual(mockActiveOfficerDetailsFormatted.serviceAddress);
    expect(formattedOfficerDetails.residentialAddress).toEqual(mockActiveOfficerDetailsFormatted.residentialAddress);
  });

});
