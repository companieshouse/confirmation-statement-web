jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import { Resource } from "@companieshouse/api-sdk-node";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { getActiveOfficerDetailsData, formatOfficerDetails } from "../../src/services/active.officer.details.service";
import { ActiveOfficerDetails, ConfirmationStatementService } from "private-api-sdk-node/dist/services/confirmation-statement";
import { mockActiveOfficerDetails, mockActiveOfficerDetailsFormatted } from "../mocks/active.officer.details.mock";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";


const mockGetActiveOfficerDetails = ConfirmationStatementService.prototype.getActiveOfficerDetails as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test active officer details service", () => {

  const companyNumber = "12345678";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the active officer details data", async () => {

    const resource: Resource<ActiveOfficerDetails> = {
      httpStatusCode: 200,
      resource: mockActiveOfficerDetails
    };

    mockGetActiveOfficerDetails.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getActiveOfficerDetailsData(session, companyNumber);

    expect(mockGetActiveOfficerDetails).toBeCalledWith(companyNumber);
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
    const expectedMessage = "Error retrieving active officer details: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getActiveOfficerDetailsData(session, companyNumber);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);

  });

});

describe("Format officer details test", () => {
  it ("should convert officer details to presentible format ", () => {
    const formattedOfficerDetails: ActiveOfficerDetails = formatOfficerDetails(clone(mockActiveOfficerDetails));
    expect(formattedOfficerDetails.foreName1).toEqual(mockActiveOfficerDetailsFormatted.foreName1);
    expect(formattedOfficerDetails.foreName2).toEqual(mockActiveOfficerDetailsFormatted.foreName2);
    expect(formattedOfficerDetails.surname).toEqual(mockActiveOfficerDetailsFormatted.surname);
    expect(formattedOfficerDetails.nationality).toEqual(mockActiveOfficerDetailsFormatted.nationality);
    expect(formattedOfficerDetails.occupation).toEqual(mockActiveOfficerDetailsFormatted.occupation);
    expect(formattedOfficerDetails.serviceAddressLine1).toEqual(mockActiveOfficerDetailsFormatted.serviceAddressLine1);
    expect(formattedOfficerDetails.serviceAddressPostTown).toEqual(mockActiveOfficerDetailsFormatted.serviceAddressPostTown);
    expect(formattedOfficerDetails.serviceAddressPostcode).toEqual(mockActiveOfficerDetailsFormatted.serviceAddressPostcode);
    expect(formattedOfficerDetails.uraLine1).toEqual(mockActiveOfficerDetailsFormatted.uraLine1);
    expect(formattedOfficerDetails.uraPostTown).toEqual(mockActiveOfficerDetailsFormatted.uraPostTown);
    expect(formattedOfficerDetails.uraPostcode).toEqual(mockActiveOfficerDetailsFormatted.uraPostcode);
  });

});
