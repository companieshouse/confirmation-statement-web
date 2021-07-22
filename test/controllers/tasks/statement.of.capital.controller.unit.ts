jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/statement.of.capital.service");
jest.mock("../../../src/services/confirmation.statement.service");

import { updateConfirmationStatement } from "../../../src/services/confirmation.statement.service";
import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { STATEMENT_OF_CAPITAL_PATH, TASK_LIST_PATH } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import app from "../../../src/app";
import { STATEMENT_OF_CAPITAL_ERROR } from "../../../src/utils/constants";
import { getStatementOfCapitalData } from "../../../src/services/statement.of.capital.service";
import {
  mockConfirmationStatementSubmission,
  mockStatementOfCapital
} from "../../mocks/confirmation.statement.submission.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockGetStatementOfCapitalData = getStatementOfCapitalData as jest.Mock;
const mockUpdateConfirmationStatement =  updateConfirmationStatement as jest.Mock;

const PAGE_HEADING = "Review the statement of capital";
const STOP_PAGE_HEADING = "You cannot use this service - File a confirmation statement";
const COMPANY_NUMBER = "12345678";
const SUBMISSION_ID = "a80f09e2";
const TRANSACTION_ID = "111-111-111";
const STATEMENT_OF_CAPITAL_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const TASK_LIST_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

describe("Statement of Capital controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetStatementOfCapitalData.mockClear();
    mockUpdateConfirmationStatement.mockClear();
  });

  describe("get tests", () => {
    it("should navigate to the statement of capital page", async () => {
      mockGetStatementOfCapitalData.mockReturnValueOnce(mockStatementOfCapital);
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Check the statement of capital");
    });

    it("Should return an error page if error is thrown in get function", async () => {
      const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
      spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);

      expect(response.text).toContain("Sorry, the service is unavailable");

      // restore original function so it is no longer mocked
      spyGetUrlWithCompanyNumber.mockRestore();
    });

    it("Should return an error page if error is thrown when service is called", async () => {
      mockGetStatementOfCapitalData.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);
      expect(response.text).toContain("Sorry, the service is unavailable");
    });
  });

  describe("post tests", () => {
    it("Should navigate to the task list page when statement of capital confirmed", async () => {
      mockUpdateConfirmationStatement.mockReturnValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ sessionCookie: `{ statementOfCapital: ${mockStatementOfCapital} }` })
        .send({ statementOfCapital: "yes" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      expect(mockUpdateConfirmationStatement).toBeCalled();
    });

    it("Should navigate to the statement of capital stop page when statement of capital is declared incorrect", async () => {
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ statementOfCapital: "no" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
    });

    it("Should redisplay statement of capital page with error when radio button is not selected", async () => {
      const response = await request(app).post(STATEMENT_OF_CAPITAL_URL);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(STATEMENT_OF_CAPITAL_ERROR);
      expect(response.text).toContain("Check the statement of capital");
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
      spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(STATEMENT_OF_CAPITAL_URL);

      expect(response.text).toContain("Sorry, the service is unavailable");

      // restore original function so it is no longer mocked
      spyGetUrlWithCompanyNumber.mockRestore();
    });
  });
});
