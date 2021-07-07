jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/date");
jest.mock("../../src/utils/api.enumerations");

import { formatForDisplay, getCompanyProfile } from "../../src/services/company.profile.service";
import { CompanyProfile, ConfirmationStatement } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../src/utils/logger";
import { validCompanyProfile, validSDKResource } from "../mocks/company.profile.mock";
import { toReadableFormat } from "../../src/utils/date";
import { lookupCompanyStatus, lookupCompanyType } from "../../src/utils/api.enumerations";

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyProfile = jest.fn();
const mockToReadableFormat = toReadableFormat as jest.Mock;
const mockLookupCompanyStatus = lookupCompanyStatus as jest.Mock;
const mockLookupCompanyType = lookupCompanyType as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreateApiClient.mockReturnValue({
  companyProfile: {
    getCompanyProfile: mockGetCompanyProfile
  }
});

mockCreateAndLogError.mockReturnValue(new Error());

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company profile service test", () => {
  const COMPANY_NUMBER = "1234567";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompanyProfile tests", () => {
    it("Should return a company profile", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(clone(validSDKResource));
      const returnedProfile: CompanyProfile = await getCompanyProfile(COMPANY_NUMBER);

      Object.getOwnPropertyNames(validSDKResource.resource).forEach(property => {
        expect(returnedProfile).toHaveProperty(property);
      });
    });

    it("Should throw an error if status code >= 400", async () => {
      const HTTP_STATUS_CODE = 400;
      mockGetCompanyProfile.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<CompanyProfile>);

      await getCompanyProfile(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if no response returned from SDK", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(undefined);

      await getCompanyProfile(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no response"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if no response resource returned from SDK", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce({} as Resource<CompanyProfile>);

      await getCompanyProfile(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no resource"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });
  });

  describe("formatForDisplay tests", () => {
    it("Should convert dates into a readable format", () => {
      const formattedDate = "15 April 2019";
      mockToReadableFormat.mockReturnValue(formattedDate);
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile));

      expect(mockToReadableFormat.mock.calls[0][0]).toEqual(validCompanyProfile.dateOfCreation);
      expect(mockToReadableFormat.mock.calls[1][0]).toEqual(validCompanyProfile.confirmationStatement?.nextDue);
      expect(mockToReadableFormat.mock.calls[2][0]).toEqual(validCompanyProfile.confirmationStatement?.nextMadeUpTo);
      expect(formattedCompanyProfile.dateOfCreation).toEqual(formattedDate);
      expect(formattedCompanyProfile.confirmationStatement?.nextDue).toEqual(formattedDate);
      expect(formattedCompanyProfile.confirmationStatement?.nextMadeUpTo).toEqual(formattedDate);
    });

    it("Should convert company type into readable format", () => {
      const formattedCompanyType = "Limited Liability Partnership";
      mockLookupCompanyType.mockReturnValueOnce(formattedCompanyType);
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile));

      expect(mockLookupCompanyType).toBeCalledWith(validCompanyProfile.type);
      expect(formattedCompanyProfile.type).toEqual(formattedCompanyType);
    });

    it("Should convert company status into readable format", () => {
      const formattedCompanyStatus = "Active";
      mockLookupCompanyStatus.mockReturnValueOnce(formattedCompanyStatus);
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile));

      expect(mockLookupCompanyStatus).toBeCalledWith(validCompanyProfile.companyStatus);
      expect(formattedCompanyProfile.companyStatus).toEqual(formattedCompanyStatus);
    });

    it("Should not try to convert confirmation statement dates if confirmation statement undefined", () => {
      const clonedCompanyProfile: CompanyProfile = clone(validCompanyProfile);
      clonedCompanyProfile.confirmationStatement = undefined as unknown as ConfirmationStatement;

      formatForDisplay(clonedCompanyProfile);

      expect(mockToReadableFormat.mock.calls[0][0]).toEqual(validCompanyProfile.dateOfCreation);
      expect(mockToReadableFormat).toBeCalledTimes(1);
    });

    it("Should return empty strings for undefined dates", () => {
      mockToReadableFormat.mockReturnValue("30 April 2019");
      const clonedCompanyProfile: CompanyProfile = clone(validCompanyProfile);
      if (clonedCompanyProfile.confirmationStatement) {
        clonedCompanyProfile.confirmationStatement.nextMadeUpTo = undefined as unknown as string;
      }

      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(clonedCompanyProfile));

      expect(formattedCompanyProfile.confirmationStatement?.nextMadeUpTo).toEqual("");
    });
  });

});
