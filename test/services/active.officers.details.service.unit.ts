jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/company-officers");

import CompanyOfficersService from "@companieshouse/api-sdk-node/dist/services/company-officers/service";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { mockActiveOfficersDetails } from "../mocks/active.officers.details.mock";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { getActiveOfficersDetailsData } from "../../src/services/active.officers.details.service";

const mockGetActiveOfficersDetails = CompanyOfficersService.prototype.getCompanyOfficers as jest.Mock;
const mockCreatePublicApiKeyClient = createApiClient as jest.Mock;

mockCreatePublicApiKeyClient.mockReturnValue({
  companyOfficers: CompanyOfficersService.prototype
} as ApiClient);

// const clone = (objectToClone: any): any => {
//   return JSON.parse(JSON.stringify(objectToClone));
// };

describe("Test active officers details service", () => {

  const COMPANY_NUMBER = "11111111";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the active officers details data", async () => {

    const resource: Resource<CompanyOfficers> = {
      httpStatusCode: 200,
      resource: {
        items: mockActiveOfficersDetails,
        activeCount: "4",
        etag: "etag",
        inactiveCount: "0",
        itemsPerPage: "5",
        kind: "kind",
        resignedCount: "0",
        startIndex: "0",
        links: { self: "self" } }
    };

    mockGetActiveOfficersDetails.mockResolvedValueOnce(resource);
    const response = await getActiveOfficersDetailsData(COMPANY_NUMBER);

    expect(mockGetActiveOfficersDetails).toBeCalledWith(COMPANY_NUMBER);
    expect(response).toEqual(mockActiveOfficersDetails);

  });

//   it("should throw error when http error code is returned", async () => {
//
//     const errorMessage = "Oops! Someone stepped on the wire.";
//     const errorResponse: ApiErrorResponse = {
//       httpStatusCode: 404,
//       errors: [{ error: errorMessage }]
//     };
//
//     mockGetActiveOfficersDetails.mockReturnValueOnce(errorResponse);
//     const session =  getSessionRequest({ access_token: "token" });
//     const expectedMessage = "Error retrieving active officer details: " + JSON.stringify(errorResponse);
//     let actualMessage;
//
//     try {
//       await getActiveOfficersDetailsData();
//     } catch (err) {
//       actualMessage = err.message;
//     }
//
//     expect(actualMessage).toBeTruthy();
//     expect(actualMessage).toEqual(expectedMessage);
//
//   });
//
// });
//
// describe("Format officers details test", () => {
//   it ("should convert officers details to presentible format ", () => {
//     const formattedOfficerDetails: ActiveOfficerDetails = formatOfficerDetails(clone(mockActiveOfficersDetails[0]));
//     expect(formattedOfficerDetails.foreName1).toEqual(mockActiveOfficersDetailsFormatted.foreName1);
//     expect(formattedOfficerDetails.foreName2).toEqual(mockActiveOfficersDetailsFormatted.foreName2);
//     expect(formattedOfficerDetails.surname).toEqual(mockActiveOfficersDetailsFormatted.surname);
//     expect(formattedOfficerDetails.nationality).toEqual(mockActiveOfficersDetailsFormatted.nationality);
//     expect(formattedOfficerDetails.occupation).toEqual(mockActiveOfficersDetailsFormatted.occupation);
//     expect(formattedOfficerDetails.serviceAddress).toEqual(mockActiveOfficersDetailsFormatted.serviceAddress);
//     expect(formattedOfficerDetails.residentialAddress).toEqual(mockActiveOfficersDetailsFormatted.residentialAddress);
//   });
//
// });
//
// describe("Get the list of officer types present", () => {
//   it ("should return a list of officer types from the officers list ", () => {
//     const officerTypeList = getOfficerTypeList(mockActiveOfficersDetails);
//     expect(officerTypeList).toContain("naturalSecretary");
//     expect(officerTypeList).toContain("corporateSecretary");
//   });

});
