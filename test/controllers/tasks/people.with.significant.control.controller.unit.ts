import { urlUtils } from "../../../src/utils/url";

jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/confirmation.statement.service");

import mocks from "../../mocks/all.middleware.mock";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR } from "../../../src/utils/constants";
import {
  getConfirmationStatement,
  updateConfirmationStatement
} from "../../../src/services/confirmation.statement.service";
import { mockConfirmationStatementSubmission } from "../../mocks/confirmation.statement.submission.mock";

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
const mockUpdateConfirmationStatement = updateConfirmationStatement as jest.Mock;

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_TITLE = "Review the people with significant control";
const PAGE_HEADING = "Check the people with significant control (PSC)";
const STOP_PAGE_HEADING = "Update the people with significant control (PSC) details";
const COMPANY_NUMBER = "12345678";
const PEOPLE_WITH_SIGNIFICANT_CONTROL_URL = PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH.replace(":companyNumber", COMPANY_NUMBER);

describe("People with significant control controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockUpdateConfirmationStatement.mockReset();
  });

  describe("get tests", function () {
    it("should navigate to the active pscs page", async () => {
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

      expect(response.text).toContain("Sorry, the service is unavailable");

      spyGetUrlToPath.mockRestore();
    });
  });

  describe("post tests", function () {
    it("Should redisplay psc page with error when radio button is not selected", async () => {
      const response = await request(app).post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_TITLE);
      expect(response.text).toContain(PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR);
      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display wrong psc data page when no radio button is selected", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: "no" });

      expect(mockUpdateConfirmationStatement).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
    });

    it("Should return 200 when yes radio button is selected", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: "yes" });

      expect(mockUpdateConfirmationStatement).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

      expect(response.text).toContain("Sorry, the service is unavailable");

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });
  });
});
