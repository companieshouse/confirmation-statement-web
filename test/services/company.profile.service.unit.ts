jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");

import { getCompanyProfile } from "../../src/services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import logger from "../../src/utils/logger";
import { validSDKResource } from "../mocks/company.profile.mock";

const mockLoggerError = logger.error as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyProfile = jest.fn();

mockCreateApiClient.mockReturnValue({
  companyProfile: {
    getCompanyProfile: mockGetCompanyProfile
  }
});

describe("Company profile service test", () => {
  const COMPANY_NUMBER = "1234567";

  beforeEach(() => {
    mockGetCompanyProfile.mockReset();
    mockLoggerError.mockClear();
    mockCreateApiClient.mockClear();
  });

  it("Should return a company profile", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validSDKResource);
    const returnedProfile = await getCompanyProfile(COMPANY_NUMBER);

    expect(returnedProfile).toBe(validSDKResource.resource);
  });

  it("Should throw an error if status code == 400", () => {
    const HTTP_STATUS_CODE = 400;
    mockGetCompanyProfile.mockResolvedValueOnce({
      httpStatusCode: HTTP_STATUS_CODE
    } as Resource<CompanyProfile>);

    getCompanyProfile(COMPANY_NUMBER)
      .then(() => {
        fail("Was expecting an error to be thrown.");
      })
      .catch((error: Error) => {
        expect(error.message).toContain(HTTP_STATUS_CODE);
        expect(error.message).toContain(COMPANY_NUMBER);
        expect(mockLoggerError).toHaveBeenCalled();
      });
  });

  it("Should throw an error if status code > 400", () => {
    const HTTP_STATUS_CODE = 502;
    mockGetCompanyProfile.mockResolvedValueOnce({
      httpStatusCode: HTTP_STATUS_CODE
    } as Resource<CompanyProfile>);

    getCompanyProfile(COMPANY_NUMBER)
      .then(() => {
        fail("Was expecting an error to be thrown.");
      })
      .catch((error: Error) => {
        expect(error.message).toContain(HTTP_STATUS_CODE);
        expect(error.message).toContain(COMPANY_NUMBER);
        expect(mockLoggerError).toHaveBeenCalled();
      });
  });

  it("Should throw an error if no response returned from SDK", () => {
    mockGetCompanyProfile.mockResolvedValueOnce(undefined);

    getCompanyProfile(COMPANY_NUMBER)
      .then(() => {
        fail("Was expecting an error to be thrown.");
      })
      .catch((error: Error) => {
        expect(error.message).toContain("no response");
        expect(error.message).toContain(COMPANY_NUMBER);
        expect(mockLoggerError).toHaveBeenCalled();
      });
  });

  it("Should throw an error if no response resource returned from SDK", () => {
    mockGetCompanyProfile.mockResolvedValueOnce({} as Resource<CompanyProfile>);

    getCompanyProfile(COMPANY_NUMBER)
      .then(() => {
        fail("Was expecting an error to be thrown.");
      })
      .catch((error: Error) => {
        expect(error.message).toContain("no resource");
        expect(error.message).toContain(COMPANY_NUMBER);
        expect(mockLoggerError).toHaveBeenCalled();
      });
  });
});


