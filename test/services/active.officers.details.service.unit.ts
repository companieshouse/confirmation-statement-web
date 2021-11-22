jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getActiveOfficersDetailsData } from "../../src/services/active.officers.details.service";
import { mockActiveOfficersDetails, mockActiveOfficersDetailsFormatted } from "../mocks/active.officers.details.mock";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { formatOfficerDetails } from "../../src/utils/format";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {
  ActiveOfficerDetails,
  ConfirmationStatementService
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const mockGetActiveOfficersDetails = ConfirmationStatementService.prototype.getListActiveOfficerDetails as jest.Mock;
const mockCreatePrivateApiClient = createApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test active officers details service", () => {

  const TRANSACTION_ID = "66454";
  const SUBMISSION_ID = "435435";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the active officers details data", async () => {

    const resource: Resource<ActiveOfficerDetails> = {
      httpStatusCode: 200,
      resource: mockActiveOfficersDetails
    };

    mockGetActiveOfficersDetails.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getActiveOfficersDetailsData(session, TRANSACTION_ID, SUBMISSION_ID);

    expect(mockGetActiveOfficersDetails).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
    expect(response).toEqual(mockActiveOfficersDetails);

  });

  it("should throw error when http error code is returned", async () => {

    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetActiveOfficersDetails.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving active officer details: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getActiveOfficersDetailsData(session, TRANSACTION_ID, SUBMISSION_ID);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);

  });

});

describe("Format officers details test", () => {
  it ("should convert officers details to presentible format ", () => {
    const formattedOfficerDetails: ActiveOfficerDetails = formatOfficerDetails(clone(mockActiveOfficersDetails));
    expect(formattedOfficerDetails.foreName1).toEqual(mockActiveOfficersDetailsFormatted.foreName1);
    expect(formattedOfficerDetails.foreName2).toEqual(mockActiveOfficersDetailsFormatted.foreName2);
    expect(formattedOfficerDetails.surname).toEqual(mockActiveOfficersDetailsFormatted.surname);
    expect(formattedOfficerDetails.nationality).toEqual(mockActiveOfficersDetailsFormatted.nationality);
    expect(formattedOfficerDetails.occupation).toEqual(mockActiveOfficersDetailsFormatted.occupation);
    expect(formattedOfficerDetails.serviceAddress).toEqual(mockActiveOfficersDetailsFormatted.serviceAddress);
    expect(formattedOfficerDetails.residentialAddress).toEqual(mockActiveOfficersDetailsFormatted.residentialAddress);
  });

});
