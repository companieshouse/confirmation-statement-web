jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.officers.details.service");
jest.mock("../../../src/services/confirmation.statement.service");
jest.mock("../../../src/utils/format");
jest.mock("../../../src/utils/update.confirmation.statement.submission");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_DETAILS_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { getActiveOfficersDetailsData, getOfficerTypeList } from "../../../src/services/active.officers.details.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetActiveOfficerDetailsData = getActiveOfficersDetailsData as jest.Mock;
const mockGetOfficerTypeList = getOfficerTypeList as jest.Mock;

const COMPANY_NUMBER = "12345678";
const ACTIVE_OFFICER_DETAILS_URL = ACTIVE_OFFICERS_DETAILS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
// const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";

describe("Active officers controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetActiveOfficerDetailsData.mockClear();
    mockGetOfficerTypeList.mockClear();
  });

  describe("get tests", () => {
    it("Should navigate to TODO", async () => {
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.header.location).toEqual("TODO");
    });

    //   it("Should navigate to an error page if the called service throws an error", async () => {
    //     mockGetActiveOfficerDetailsData.mockImplementationOnce(() => {throw new Error(); });

    //     const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

    //     expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    //   });

    //   it("Should throw an error if list of officer is empty", async () => {
    //     mockGetOfficerTypeList.mockReturnValue([]);

    //     const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

    //     expect(response.status).toEqual(500);
    //     expect(response.text).toContain("Sorry, the service is unavailable");
    //   });

  });
});
