jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.officer.details.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { OFFICER_DETAILS_ERROR } from "../../../src/utils/constants";
import { urlUtils } from "../../../src/utils/url";
import { mockActiveOfficerDetails } from "../../mocks/active.officer.details.mock";
import { getActiveOfficerDetailsData, formatOfficerDetails } from "../../../src/services/active.officer.details.service";

jest.mock("../../../src/middleware/company.authentication.middleware");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetActiveOfficerDetails = getActiveOfficerDetailsData as jest.Mock;
const mockformatOfficerDetails = formatOfficerDetails as jest.Mock;

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Check the director's details";
const WRONG_OFFICER_PAGE_HEADING = "Update officers - File a confirmation statement";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const ACTIVE_OFFICER_DETAILS_URL = ACTIVE_OFFICERS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Active officers controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetActiveOfficerDetails.mockClear();
    mockformatOfficerDetails.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to director's details page", async () => {
      mockGetActiveOfficerDetails.mockResolvedValueOnce(mockActiveOfficerDetails);
      mockformatOfficerDetails.mockReturnValueOnce(mockActiveOfficerDetails);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Is the director still active?");
      expect(response.text).toContain(mockActiveOfficerDetails.foreName1);
      expect(response.text).toContain(mockActiveOfficerDetails.foreName2);
      expect(response.text).toContain(mockActiveOfficerDetails.dateOfBirth);
      expect(response.text).toContain(mockActiveOfficerDetails.nationality);
      expect(response.text).toContain(mockActiveOfficerDetails.uraLine1);
    });

    it("Should navigate to director's details page with no middle name", async () => {
      const fName2 = mockActiveOfficerDetails.foreName2;
      mockActiveOfficerDetails.foreName2 = undefined;

      mockGetActiveOfficerDetails.mockResolvedValueOnce(mockActiveOfficerDetails);
      mockformatOfficerDetails.mockReturnValueOnce(mockActiveOfficerDetails);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Is the director still active?");
      expect(response.text).toContain(mockActiveOfficerDetails.foreName1);
      expect(response.text).toContain(mockActiveOfficerDetails.dateOfBirth);
      expect(response.text).toContain(mockActiveOfficerDetails.nationality);
      expect(response.text).toContain(mockActiveOfficerDetails.uraLine1);
      expect(response.text).not.toContain(fName2);

      mockActiveOfficerDetails.foreName2 = fName2;
    });

    it("Should navigate to director's details page for secure officer", async () => {
      mockActiveOfficerDetails.secureIndicator = 'Y';

      mockGetActiveOfficerDetails.mockResolvedValueOnce(mockActiveOfficerDetails);
      mockformatOfficerDetails.mockReturnValueOnce(mockActiveOfficerDetails);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Is the director still active?");
      expect(response.text).toContain(mockActiveOfficerDetails.foreName1);
      expect(response.text).toContain(mockActiveOfficerDetails.dateOfBirth);
      expect(response.text).toContain(mockActiveOfficerDetails.nationality);
      expect(response.text).not.toContain("Usual residential address");
      expect(response.text).not.toContain(mockActiveOfficerDetails.uraLine1);

      mockActiveOfficerDetails.secureIndicator = 'N';
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      spyGetUrl.mockRestore();
    });

    it("Should navigate to an error page if the called service throws an error", async () => {
      mockGetActiveOfficerDetails.mockImplementationOnce(() => {throw new Error(); });

      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    });

  });

  describe("post tests", () => {

    it("Should return to task list page when officer details is confirmed", async () => {
      const response = await request(app)
        .post(ACTIVE_OFFICER_DETAILS_URL)
        .send({ activeDirectors: "yes" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should go to stop page when officer details radio button is no", async () => {
      const response = await request(app)
        .post(ACTIVE_OFFICER_DETAILS_URL)
        .send({ activeDirectors: "no" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_OFFICER_PAGE_HEADING);
    });

    it("Should redisplay active officers page with error when radio button is not selected", async () => {
      const response = await request(app).post(ACTIVE_OFFICER_DETAILS_URL);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(OFFICER_DETAILS_ERROR);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrl.mockRestore();
    });
  });
});
