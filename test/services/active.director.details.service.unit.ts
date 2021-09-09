jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getActiveDirectorDetailsData } from "../../src/services/active.director.details.service";
import { mockActiveDirectorDetails, mockActiveDirectorDetailsFormatted } from "../mocks/active.director.details.mock";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { formatDirectorDetails } from "../../src/utils/format";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {
  ActiveDirectorDetails,
  ConfirmationStatementService
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const mockGetActiveDirectorDetails = ConfirmationStatementService.prototype.getActiveDirectorDetails as jest.Mock;
const mockCreatePrivateApiClient = createApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

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
