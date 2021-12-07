jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/company-officers/service");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { mockActiveOfficersDetails } from "../mocks/active.officers.details.mock";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { getActiveOfficersDetailsData } from "../../src/services/active.officers.details.service";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers";
import CompanyOfficersService from "@companieshouse/api-sdk-node/dist/services/company-officers/service";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { COMPANY_OFFICERS_ACTIVE_MAX_ALLOWED, COMPANY_OFFICERS_API_PAGE_SIZE } from "../../src/utils/properties";

const mockGetCompanyOfficers = CompanyOfficersService.prototype.getCompanyOfficers as jest.Mock;
const mockCreatePublicApiKeyClient = createApiClient as jest.Mock;

mockCreatePublicApiKeyClient.mockReturnValue({
  companyOfficers: CompanyOfficersService.prototype
} as ApiClient);

describe("Test active officers details service", () => {

  const COMPANY_NUMBER = "11111111";
  const PAGE_SIZE: number = parseInt(COMPANY_OFFICERS_API_PAGE_SIZE, 10);

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
        itemsPerPage: COMPANY_OFFICERS_API_PAGE_SIZE,
        kind: "kind",
        resignedCount: "0",
        startIndex: "0",
        links: { self: "self" } }
    };

    mockGetCompanyOfficers.mockResolvedValue(resource);
    const response = await getActiveOfficersDetailsData(COMPANY_NUMBER);

    expect(mockGetCompanyOfficers).toBeCalledWith(COMPANY_NUMBER, PAGE_SIZE, 0, false, "resigned_on");
    // last officer should be not active so should not be returned from function
    expect(response).not.toContain(mockActiveOfficersDetails[3]);

    expect(response).toContain(mockActiveOfficersDetails[0]);
    expect(response).toContain(mockActiveOfficersDetails[1]);
    expect(response).toContain(mockActiveOfficersDetails[2]);
    expect(response.length).toEqual(3);
  });

  it("should throw error when http error code is returned", async () => {
    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetCompanyOfficers.mockResolvedValueOnce(errorResponse);
    const expectedMessage = "Error retrieving active officer details: " + JSON.stringify(errorResponse);
    let actualMessage: any;

    try {
      await getActiveOfficersDetailsData(COMPANY_NUMBER);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });

  it(`should throw error when > ${COMPANY_OFFICERS_ACTIVE_MAX_ALLOWED} active officers are returned from sdk`, async () => {
    const resource: Resource<CompanyOfficers> = {
      httpStatusCode: 200,
      resource: {
        items: mockActiveOfficersDetails,
        activeCount: "6",
        etag: "etag",
        inactiveCount: "0",
        itemsPerPage: COMPANY_OFFICERS_API_PAGE_SIZE,
        kind: "kind",
        resignedCount: "0",
        startIndex: "0",
        links: { self: "self" } }
    };

    mockGetCompanyOfficers.mockResolvedValue(resource);
    const companyOfficers: CompanyOfficers = resource.resource as CompanyOfficers;
    const expectedMessage = `Active officer count for company ${COMPANY_NUMBER} is greater than ${COMPANY_OFFICERS_ACTIVE_MAX_ALLOWED} with value of ${companyOfficers.activeCount}`;
    let actualMessage: any;

    try {
      await getActiveOfficersDetailsData(COMPANY_NUMBER);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });

  it("should throw error when no active officers are returned from sdk", async () => {
    const resource: Resource<CompanyOfficers> = {
      httpStatusCode: 200,
      resource: {
        items: mockActiveOfficersDetails,
        activeCount: "0",
        etag: "etag",
        inactiveCount: "0",
        itemsPerPage: COMPANY_OFFICERS_API_PAGE_SIZE,
        kind: "kind",
        resignedCount: "0",
        startIndex: "0",
        links: { self: "self" } }
    };

    mockGetCompanyOfficers.mockResolvedValue(resource);
    const expectedMessage = `No active officers found for company ${COMPANY_NUMBER}, active count is 0`;
    let actualMessage: any;

    try {
      await getActiveOfficersDetailsData(COMPANY_NUMBER);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
