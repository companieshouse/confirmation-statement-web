jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/validators/company.number.validator");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { USE_PAPER_PATH, URL_QUERY_PARAM } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

const mockIsCompanyNumberValid = isCompanyNumberValid as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const USE_PAPER_FILING_PAGE_TITLE = "You cannot use this service - Company Type Paper Filing";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, the service is unavailable";

describe("User paper filing controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetCompanyProfile.mockClear();
    mockIsCompanyNumberValid.mockReturnValue(true);
    validCompanyProfile.type = "limited";
  });

  describe("tests for the get function", () => {

    it("Should render the use paper filing stop page for limited company", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const usePaperFilingPath = urlUtils.setQueryParam(USE_PAPER_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);

      const response = await request(app).get(usePaperFilingPath);

      expect(mockGetCompanyProfile).toBeCalledWith(validCompanyProfile.companyNumber);
      expect(response.text).toContain(USE_PAPER_FILING_PAGE_TITLE);
      expect(response.text).toContain("CS01 confirmation statement paper form");
    });

    it("Should render the use paper filing stop page for limited partnership", async () => {
      validCompanyProfile.type = "limited-partnership";
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const usePaperFilingPath = urlUtils.setQueryParam(USE_PAPER_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);

      const response = await request(app).get(usePaperFilingPath);

      expect(response.text).toContain(USE_PAPER_FILING_PAGE_TITLE);
      expect(response.text).toContain("SLP CSO1 confirmation statement paper form");
    });

    it("Should render the use paper filing stop page for scottish partnership", async () => {
      validCompanyProfile.type = "scottish-partnership";
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const usePaperFilingPath = urlUtils.setQueryParam(USE_PAPER_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);

      const response = await request(app).get(usePaperFilingPath);

      expect(response.text).toContain(USE_PAPER_FILING_PAGE_TITLE);
      expect(response.text).toContain("SQP CSO1 confirmation statement paper form");
    });

    it("Should return an error page if invalid company number is entered in url query param", async () => {
      mockIsCompanyNumberValid.mockReturnValueOnce(false);
      const invalidCompanyStatusPath = urlUtils.setQueryParam(USE_PAPER_PATH, URL_QUERY_PARAM.COMPANY_NUM, "this is not a valid number");

      const response = await request(app).get(invalidCompanyStatusPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });
  });
});
