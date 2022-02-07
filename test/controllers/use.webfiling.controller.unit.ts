jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/validators/company.number.validator");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { URL_QUERY_PARAM, USE_WEBFILING_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockIsCompanyNumberValid = isCompanyNumberValid as jest.Mock;
mockIsCompanyNumberValid.mockReturnValue(true);

const STOP_PAGE_TITLE_USE_WEBFILING = "You cannot use this service - Company Details";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, the service is unavailable";

describe("Invalid company status controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetCompanyProfile.mockClear();
    mockIsCompanyNumberValid.mockClear();
  });

  describe("get() tests", () => {

    it("Should render the use webfiling stop page", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const useWebFilingPath = urlUtils.setQueryParam(USE_WEBFILING_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);

      const response = await request(app).get(useWebFilingPath);

      expect(mockGetCompanyProfile).toBeCalledWith(validCompanyProfile.companyNumber);
      expect(response.text).toContain(STOP_PAGE_TITLE_USE_WEBFILING);
      expect(response.text).toContain("our Webfiling service");
      expect(response.text).toContain(`You cannot file a confirmation statement for ${validCompanyProfile.companyName}`);
    });


    it("Should return an error page if error is thrown in get function", async () => {
      mockGetCompanyProfile.mockImplementationOnce(() => { throw new Error(); });
      const useWebFilingPath = urlUtils.setQueryParam(USE_WEBFILING_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);

      const response = await request(app).get(useWebFilingPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });

    it("Should return an error page if invalid company number is entered in url query param", async () => {
      mockIsCompanyNumberValid.mockReturnValueOnce(false);
      const useWebFilingPath = urlUtils.setQueryParam(USE_WEBFILING_PATH, URL_QUERY_PARAM.COMPANY_NUM, "this is not a valid number");

      const response = await request(app).get(useWebFilingPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });
  });
});
