jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/date.formatter");
jest.mock("../../src/utils/api.enumerations");

import { getCompanyProfile } from "../../src/services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import logger from "../../src/utils/logger";
import { validSDKResource } from "../mocks/company.profile.mock";
import { readableFormat } from "../../src/utils/date.formatter";
import { lookupCompanyStatus, lookupCompanyType } from "../../src/utils/api.enumerations";

const mockLoggerError = logger.error as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyProfile = jest.fn();
const mockReadableFormat = readableFormat as jest.Mock;
const mockLookupCompanyStatus = lookupCompanyStatus as jest.Mock;
const mockLookupCompanyType = lookupCompanyType as jest.Mock;

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
    mockReadableFormat.mockReset();
    mockLookupCompanyStatus.mockReset();
    mockLookupCompanyType.mockReset();
  });

  it("Should return a company profile", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(JSON.parse(JSON.stringify(validSDKResource)));
    const returnedProfile: CompanyProfile = await getCompanyProfile(COMPANY_NUMBER);

    Object.getOwnPropertyNames(validSDKResource.resource).forEach(property => {
      expect(returnedProfile).toHaveProperty(property);
    });
  });

  it("Should convert dates into a readable format", async () => {
    mockReadableFormat.mockReturnValue("30 April 2019");
    mockGetCompanyProfile.mockResolvedValueOnce(JSON.parse(JSON.stringify(validSDKResource)));
    await getCompanyProfile(COMPANY_NUMBER);

    expect(mockReadableFormat.mock.calls[0][0]).toEqual(validSDKResource?.resource?.dateOfCreation);
    expect(mockReadableFormat.mock.calls[1][0]).toEqual(validSDKResource?.resource?.confirmationStatement.nextDue);
    expect(mockReadableFormat.mock.calls[2][0]).toEqual(validSDKResource?.resource?.confirmationStatement.lastMadeUpTo);
    expect(mockReadableFormat.mock.calls[3][0]).toEqual(validSDKResource?.resource?.confirmationStatement.nextMadeUpTo);
  });

  it("Should return empty strings for undefined dates", async () => {
    mockReadableFormat.mockReturnValue("30 April 2019");
    const clonedSDKResource: Resource<CompanyProfile> = JSON.parse(JSON.stringify(validSDKResource));
    if (clonedSDKResource.resource) {
      clonedSDKResource.resource.confirmationStatement.lastMadeUpTo = undefined;
      clonedSDKResource.resource.confirmationStatement.nextMadeUpTo = undefined;
    }
    mockGetCompanyProfile.mockResolvedValueOnce(clonedSDKResource);
    const result: CompanyProfile = await getCompanyProfile(COMPANY_NUMBER);

    expect(result.confirmationStatement.lastMadeUpTo).toEqual("");
    expect(result.confirmationStatement.nextMadeUpTo).toEqual("");
  });

  it("Should convert company status into readable format", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(JSON.parse(JSON.stringify(validSDKResource)));
    await getCompanyProfile(COMPANY_NUMBER);

    expect(mockLookupCompanyStatus).toBeCalledWith(validSDKResource.resource?.companyStatus);
  });

  it("Should convert company type into readable format", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(JSON.parse(JSON.stringify(validSDKResource)));
    await getCompanyProfile(COMPANY_NUMBER);

    expect(mockLookupCompanyType).toBeCalledWith(validSDKResource.resource?.type);
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


