jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.director.details.service");
jest.mock("../../../src/services/confirmation.statement.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_DIRECTORS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { DIRECTOR_DETAILS_ERROR } from "../../../src/utils/constants";
import { urlUtils } from "../../../src/utils/url";
import { mockActiveDirectorDetails, mockSecureActiveDirectorDetails } from "../../mocks/active.director.details.mock";
import { getActiveDirectorDetailsData, formatDirectorDetails } from "../../../src/services/active.director.details.service";
import { getConfirmationStatement } from "../../../src/services/confirmation.statement.service";
import { mockConfirmationStatementSubmission } from "../../mocks/confirmation.statement.submission.mock";

jest.mock("../../../src/middleware/company.authentication.middleware");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetActiveDirectorDetails = getActiveDirectorDetailsData as jest.Mock;
const mockformatDirectorDetails = formatDirectorDetails as jest.Mock;
const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Check the director's details";
const WRONG_OFFICER_PAGE_HEADING = "Update officers - File a confirmation statement";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const ACTIVE_DIRECTOR_DETAILS_URL = ACTIVE_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Active directors controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetActiveDirectorDetails.mockClear();
    mockformatDirectorDetails.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to director's details page", async () => {
      mockGetActiveDirectorDetails.mockResolvedValueOnce(mockActiveDirectorDetails);
      mockformatDirectorDetails.mockReturnValueOnce(mockActiveDirectorDetails);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Is the director still active?");
      expect(response.text).toContain(mockActiveDirectorDetails.foreName1);
      expect(response.text).toContain(mockActiveDirectorDetails.foreName2);
      expect(response.text).toContain(mockActiveDirectorDetails.dateOfBirth);
      expect(response.text).toContain(mockActiveDirectorDetails.nationality);
      expect(response.text).toContain(mockActiveDirectorDetails.uraLine1);
    });

    it("Should navigate to director's details page with no middle name", async () => {
      const fName2 = mockActiveDirectorDetails.foreName2;
      mockActiveDirectorDetails.foreName2 = undefined;

      mockGetActiveDirectorDetails.mockResolvedValueOnce(mockActiveDirectorDetails);
      mockformatDirectorDetails.mockReturnValueOnce(mockActiveDirectorDetails);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Is the director still active?");
      expect(response.text).toContain(mockActiveDirectorDetails.foreName1);
      expect(response.text).toContain(mockActiveDirectorDetails.dateOfBirth);
      expect(response.text).toContain(mockActiveDirectorDetails.nationality);
      expect(response.text).toContain(mockActiveDirectorDetails.uraLine1);
      expect(response.text).not.toContain(fName2);

      mockActiveDirectorDetails.foreName2 = fName2;
    });

    it("Should navigate to director's details page for secure director", async () => {

      mockGetActiveDirectorDetails.mockResolvedValueOnce(mockSecureActiveDirectorDetails);
      mockformatDirectorDetails.mockReturnValueOnce(mockSecureActiveDirectorDetails);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Is the director still active?");
      expect(response.text).toContain(mockSecureActiveDirectorDetails.foreName1);
      expect(response.text).toContain(mockSecureActiveDirectorDetails.dateOfBirth);
      expect(response.text).toContain(mockSecureActiveDirectorDetails.nationality);
      expect(response.text).toContain("Usual residential address");
      expect(response.text).toContain(mockSecureActiveDirectorDetails.uraLine1);
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      spyGetUrl.mockRestore();
    });

    it("Should navigate to an error page if the called service throws an error", async () => {
      mockGetActiveDirectorDetails.mockImplementationOnce(() => {throw new Error(); });

      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    });

  });

  describe("post tests", () => {

    it("Should return to task list page when director details is confirmed", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(ACTIVE_DIRECTOR_DETAILS_URL)
        .send({ activeDirectors: "yes" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should go to stop page when director details radio button is no", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(ACTIVE_DIRECTOR_DETAILS_URL)
        .send({ activeDirectors: "no" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_OFFICER_PAGE_HEADING);
    });

    it("Should redisplay active directors page with error when radio button is not selected", async () => {
      const response = await request(app).post(ACTIVE_DIRECTOR_DETAILS_URL);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(DIRECTOR_DETAILS_ERROR);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrl.mockRestore();
    });
  });
});
