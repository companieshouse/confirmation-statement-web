jest.mock("../../src/validators/company.number.validator");

import mocks from "../mocks/all.middleware.mock";
import { NO_FILING_REQUIRED_PATH, TRADING_STOP_PATH, URL_QUERY_PARAM } from "../../src/types/page.urls";
import request from "supertest";
import app from "../../src/app";
import { urlUtils } from "../../src/utils/url";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

const mockIsCompanyNumberValid = isCompanyNumberValid as jest.Mock;

const NO_FILING_REQUIRED_PAGE_TITLE = "You cannot use this service - Company Trading Status";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, the service is unavailable";

describe("Trading stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockIsCompanyNumberValid.mockReturnValue(true);
  });

  describe("tests for the get function", () => {

    it("Should render the trading stop page", async () => {
      const response = await request(app).get(TRADING_STOP_PATH);

      expect(response.text).toContain(NO_FILING_REQUIRED_PAGE_TITLE);
      expect(response.text).toContain("The company’s trading status can only be changed by filing a confirmation statement through our");
    });

    it("Should return an error page if invalid company number is entered in url query param", async () => {
      mockIsCompanyNumberValid.mockReturnValueOnce(false);
      const noFilingRequiredPath = urlUtils.setQueryParam(NO_FILING_REQUIRED_PATH, URL_QUERY_PARAM.COMPANY_NUM, "this is not a valid number");
      const response = await request(app).get(noFilingRequiredPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });
  });
});
