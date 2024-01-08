jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/validators/company.number.validator");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { INVALID_COMPANY_STATUS_PATH, URL_QUERY_PARAM } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockIsCompanyNumberValid = isCompanyNumberValid as jest.Mock;
mockIsCompanyNumberValid.mockReturnValue(true);

const STOP_PAGE_TITLE_COMPANY_STATUS = "You cannot use this service - Company Status";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with the service";

describe("Invalid company status controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetCompanyProfile.mockClear();
    mockIsCompanyNumberValid.mockClear();
  });

  describe("get function tests", () => {

    it("Should render the invalid company status stop page", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const invalidCompanyStatusPath = urlUtils.setQueryParam(INVALID_COMPANY_STATUS_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);

      const response = await request(app).get(invalidCompanyStatusPath);

      expect(mockGetCompanyProfile).toBeCalledWith(validCompanyProfile.companyNumber);
      expect(response.text).toContain(STOP_PAGE_TITLE_COMPANY_STATUS);
      expect(response.text).toContain("dissolved and struck off the register");
      expect(response.text).toContain(`cannot be filed for ${validCompanyProfile.companyName}`);
    });


    it("Should return an error page if error is thrown in get function", async () => {
      mockGetCompanyProfile.mockImplementationOnce(() => { throw new Error(); });
      const invalidCompanyStatusPath = urlUtils.setQueryParam(INVALID_COMPANY_STATUS_PATH, URL_QUERY_PARAM.COMPANY_NUM, validCompanyProfile.companyNumber);

      const response = await request(app).get(invalidCompanyStatusPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });

    it("Should return an error page if invalid company number is entered in url query param", async () => {
      mockIsCompanyNumberValid.mockReturnValueOnce(false);
      const invalidCompanyStatusPath = urlUtils.setQueryParam(INVALID_COMPANY_STATUS_PATH, URL_QUERY_PARAM.COMPANY_NUM, "this is not a valid number");

      const response = await request(app).get(invalidCompanyStatusPath);

      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });
  });
});
