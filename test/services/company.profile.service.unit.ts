jest.mock("@companieshouse/api-sdk-node/dist/services/company-profile/service");

import { getCompanyProfile } from "../../src/services/company.profile.service";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Resource } from "@companieshouse/api-sdk-node";

const mockGetCompanyProfile = CompanyProfileService.prototype.getCompanyProfile as jest.Mock;

describe("Company profile service test", () => {
  const companyNumber = "1234567";

  beforeEach(() => {
    mockGetCompanyProfile.mockReset;
  });

  it("Should return a company profile", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dummySDKResponse);
    const returnedProfile = await getCompanyProfile(companyNumber);

    expect(returnedProfile).toBe(dummySDKResponse.resource);
  });

  it("Should throw an error if status code == 400", () => {
    const errorCode = 400;
    mockGetCompanyProfile.mockResolvedValueOnce({
      httpStatusCode: errorCode
    } as Resource<CompanyProfile>);

    getCompanyProfile(companyNumber)
      .then(() => {
        fail("Was expecting an error to be thrown.");
      })
      .catch((error: Error) => {
        expect(error.message).toContain(errorCode);
        expect(error.message).toContain(companyNumber);
      });
  });
});

const dummySDKResponse: Resource<CompanyProfile> = {
  httpStatusCode: 200,
  resource: {
    accounts: {
      nextAccounts: {
        periodEndOn: "2019-10-10",
        periodStartOn: "2019-01-01",
      },
      nextDue: "2020-05-31",
      overdue: false,
    },
    companyName: "Girl's school trust",
    companyNumber: "00006400",
    companyStatus: "active",
    companyStatusDetail: "company status detail",
    confirmationStatement: {
      nextDue: "2020-04-30",
      overdue: false,
    },
    dateOfCreation: "1872-06-26",
    hasBeenLiquidated: false,
    hasCharges: false,
    hasInsolvencyHistory: false,
    jurisdiction: "england-wales",
    links: {},
    registeredOfficeAddress: {
      addressLineOne: "line1",
      addressLineTwo: "line2",
      careOf: "careOf",
      country: "uk",
      locality: "locality",
      poBox: "123",
      postalCode: "post code",
      premises: "premises",
      region: "region",
    },
    sicCodes: ["123"],
    type: "limited",
  },
};

