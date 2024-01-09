jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/validators/company.number.validator");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { NO_FILING_REQUIRED_PATH, URL_QUERY_PARAM } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

const mockIsCompanyNumberValid = isCompanyNumberValid as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const NO_FILING_REQUIRED_PAGE_TITLE = "You cannot use this service - Company Type No Filing Required";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with the service";

describe("No filing required controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetCompanyProfile.mockClear();
    mockIsCompanyNumberValid.mockReturnValue(true);
  });

  describe("tests for the get function", () => {

    it("Should render the no filing required stop page", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const noFilingRequiredPath = urlUtils.setQueryParam(NO_FILING_REQUIRED_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);
      const response = await request(app).get(noFilingRequiredPath);

      expect(mockGetCompanyProfile).toBeCalledWith(validCompanyProfile.companyNumber);
      expect(response.text).toContain(NO_FILING_REQUIRED_PAGE_TITLE);
      expect(response.text).toContain("it is not required to file confirmation statements.");
    });

    it("Should return an error page if error is thrown in get function", async () => {
      mockGetCompanyProfile.mockImplementationOnce(() => { throw new Error(); });
      const noFilingRequiredPath = urlUtils.setQueryParam(NO_FILING_REQUIRED_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);
      const response = await request(app).get(noFilingRequiredPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });

    it("Should return an error page if invalid company number is entered in url query param", async () => {
      mockIsCompanyNumberValid.mockReturnValueOnce(false);
      const noFilingRequiredPath = urlUtils.setQueryParam(NO_FILING_REQUIRED_PATH, URL_QUERY_PARAM.COMPANY_NUM, "this is not a valid number");
      const response = await request(app).get(noFilingRequiredPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });
  });
});
