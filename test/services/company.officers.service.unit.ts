jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/api.enumerations");

import { getCompanyOfficers } from "../../src/services/company.officers.service";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../src/utils/logger";
import { validSDKResource } from "../mocks/company.officers.mock";
import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyOfficers = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreateApiClient.mockReturnValue({
  companyOfficers: {
    getCompanyOfficers: mockGetCompanyOfficers
  }
});

mockCreateAndLogError.mockReturnValue(new Error());

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company Officers Service Test", () => {
  const COMPANY_NUMBER = "1234567";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getCompanyOfficers should return company officers", async () => {
    mockGetCompanyOfficers.mockResolvedValueOnce(clone(validSDKResource));
    const returnedProfile: CompanyOfficers = await getCompanyOfficers(COMPANY_NUMBER);

    Object.getOwnPropertyNames(validSDKResource.resource).forEach(property => {
      expect(returnedProfile).toHaveProperty(property);
    });
  });

  it("getCompanyOfficers should throw an error if status code == 400", async () => {
    const HTTP_STATUS_CODE = 400;
    mockGetCompanyOfficers.mockResolvedValueOnce({
      httpStatusCode: HTTP_STATUS_CODE
    } as Resource<CompanyOfficers>);

    await getCompanyOfficers(COMPANY_NUMBER)
      .then(() => {
        fail("Expected an error to be thrown.");
      })
      .catch(() => {
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
      });
  });

  it("getCompanyOfficers should throw an error if status code > 400", async () => {
    const HTTP_STATUS_CODE = 502;
    mockGetCompanyOfficers.mockResolvedValueOnce({
      httpStatusCode: HTTP_STATUS_CODE
    } as Resource<CompanyOfficers>);

    await getCompanyOfficers(COMPANY_NUMBER)
      .then(() => {
        fail("Expected an error to be thrown.");
      })
      .catch(() => {
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
      });
  });

  it("getCompanyOfficers should throw an error if no response returned from SDK", async () => {
    mockGetCompanyOfficers.mockResolvedValueOnce(undefined);

    await getCompanyOfficers(COMPANY_NUMBER)
      .then(() => {
        fail("Expected an error to be thrown.");
      })
      .catch(() => {
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no response"));
      });
  });

  it("getCompanyOfficers should throw an error if no response resource returned from SDK", async () => {
    mockGetCompanyOfficers.mockResolvedValueOnce({} as Resource<CompanyOfficers>);

    await getCompanyOfficers(COMPANY_NUMBER)
      .then(() => {
        fail("Expected an error to be thrown.");
      })
      .catch(() => {
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no resource"));
      });
  });

});
