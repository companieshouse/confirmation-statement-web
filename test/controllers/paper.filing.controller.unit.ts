jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { USE_PAPER_PATH, URL_QUERY_PARAM } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const USE_PAPER_FILING_PAGE_TITLE = "You cannot use this service - Company Type Paper Filing";

describe("User paper filing controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetCompanyProfile.mockClear();
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
  });
});
