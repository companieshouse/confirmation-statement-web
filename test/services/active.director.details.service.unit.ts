jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import { Resource } from "@companieshouse/api-sdk-node";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { getActiveDirectorDetailsData, formatDirectorDetails } from "../../src/services/active.director.details.service";
import { ActiveDirectorDetails, ConfirmationStatementService } from "private-api-sdk-node/dist/services/confirmation-statement";
import { mockActiveDirectorDetails, mockActiveDirectorDetailsFormatted } from "../mocks/active.director.details.mock";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";


const mockGetActiveDirectorDetails = ConfirmationStatementService.prototype.getActiveDirectorDetails as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test active director details service", () => {

  const companyNumber = "12345678";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the active director details data", async () => {

    const resource: Resource<ActiveDirectorDetails> = {
      httpStatusCode: 200,
      resource: mockActiveDirectorDetails
    };

    mockGetActiveDirectorDetails.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getActiveDirectorDetailsData(session, companyNumber);

    expect(mockGetActiveDirectorDetails).toBeCalledWith(companyNumber);
    expect(response).toEqual(mockActiveDirectorDetails);

  });

  it("should throw error when http error code is returned", async () => {

    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetActiveDirectorDetails.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving active director details: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getActiveDirectorDetailsData(session, companyNumber);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);

  });

});

describe("Format director details test", () => {
  it ("should convert director details to presentible format ", () => {
    const formattedDirectorDetails: ActiveDirectorDetails = formatDirectorDetails(clone(mockActiveDirectorDetails));
    expect(formattedDirectorDetails.foreName1).toEqual(mockActiveDirectorDetailsFormatted.foreName1);
    expect(formattedDirectorDetails.foreName2).toEqual(mockActiveDirectorDetailsFormatted.foreName2);
    expect(formattedDirectorDetails.surname).toEqual(mockActiveDirectorDetailsFormatted.surname);
    expect(formattedDirectorDetails.nationality).toEqual(mockActiveDirectorDetailsFormatted.nationality);
    expect(formattedDirectorDetails.occupation).toEqual(mockActiveDirectorDetailsFormatted.occupation);
    expect(formattedDirectorDetails.serviceAddress).toEqual(mockActiveDirectorDetailsFormatted.serviceAddress);
    expect(formattedDirectorDetails.residentialAddress).toEqual(mockActiveDirectorDetailsFormatted.residentialAddress);
  });

});
