jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/shareholder.service");
jest.mock("../../../src/utils/update.confirmation.statement.submission");
jest.mock("../../../src/services/statement.of.capital.service");
jest.mock("../../../src/services/confirmation.statement.service");

import {
  getConfirmationStatement,
  updateConfirmationStatement
} from "../../../src/services/confirmation.statement.service";
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
import { getShareholders } from "../../../src/services/shareholder.service";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockGetStatementOfCapitalData = getStatementOfCapitalData as jest.Mock;
const mockUpdateConfirmationStatement = updateConfirmationStatement as jest.Mock;

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
const mockGetShareholders = getShareholders as jest.Mock;
const mockSendUpdate = sendUpdate as jest.Mock;

const PAGE_HEADING = "Review the statement of capital";
const STOP_PAGE_HEADING = "You cannot use this service - File a confirmation statement";
const SHARES_TOTALS_INVALID_WARNING = "The company's share capital does not match the number of shares held by its shareholders.";
const UNPAID_AMOUNT_NULL_WARNING = "The total amount unpaid for all shares is missing on this company’s statement of capital.";
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
    mockGetShareholders.mockClear();
    mockSendUpdate.mockClear();
  });

  describe("get tests", () => {

    it("should navigate to the statement of capital page with NO buttons visible, a share-capital-mismatch-warning and total-amount-unpaid-warning messages if Share totals DO NOT match and amount unpaid is NULL", async () => {
      mockGetStatementOfCapitalData.mockResolvedValueOnce({
        totalNumberOfShares: "100",
        totalAmountUnpaidForCurrency: null
      });
      mockGetShareholders.mockResolvedValue([{ shares: "123" }]);
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);

      expect(mockGetShareholders).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Check the statement of capital");
      expect(response.text).toContain(UNPAID_AMOUNT_NULL_WARNING);
      expect(response.text).toContain(SHARES_TOTALS_INVALID_WARNING);
      expect(response.text).not.toContain("Is the statement of capital correct?");
    });

    it("should navigate to the statement of capital page with NO buttons visible and a total-amount-unpaid-warning message if Amount unpaid is undefined", async () => {
      mockGetStatementOfCapitalData.mockResolvedValueOnce({
        totalNumberOfShares: "100",
        totalAmountUnpaidForCurrency: undefined
      });
      mockGetShareholders.mockResolvedValue([{ shares: "100" }]);
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);

      expect(mockGetShareholders).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Check the statement of capital");
      expect(response.text).toContain(UNPAID_AMOUNT_NULL_WARNING);
      expect(response.text).not.toContain(SHARES_TOTALS_INVALID_WARNING);
      expect(response.text).not.toContain("Is the statement of capital correct?");
    });

    it("should navigate to the statement of capital page with NO buttons visible and a total-amount-unpaid-warning message if Amount unpaid is NULL", async () => {
      mockGetStatementOfCapitalData.mockResolvedValueOnce({
        totalNumberOfShares: "100",
        totalAmountUnpaidForCurrency: null
      });
      mockGetShareholders.mockResolvedValue([{ shares: "100" }]);
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);

      expect(mockGetShareholders).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Check the statement of capital");
      expect(response.text).toContain(UNPAID_AMOUNT_NULL_WARNING);
      expect(response.text).not.toContain(SHARES_TOTALS_INVALID_WARNING);
      expect(response.text).not.toContain("Is the statement of capital correct?");
    });

    it("should navigate to the statement of capital page with NO buttons visible and a share-capital-mismatch-warning message if share totals DO NOT match the shareholders'.", async () => {
      mockGetStatementOfCapitalData.mockResolvedValueOnce(mockStatementOfCapital);
      mockGetShareholders.mockResolvedValue([{ shares: "123" }]);
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);

      expect(mockGetShareholders).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Check the statement of capital");
      expect(response.text).toContain(SHARES_TOTALS_INVALID_WARNING);
      expect(response.text).not.toContain(UNPAID_AMOUNT_NULL_WARNING);
      expect(response.text).not.toContain("Is the statement of capital correct?");
    });

    it("should navigate to the statement of capital page with buttons visible and no warning messages if Share totals match and amount unpaid is NOT NULL.", async () => {
      mockGetStatementOfCapitalData.mockResolvedValueOnce(mockStatementOfCapital);
      mockGetShareholders.mockResolvedValue([{ shares: "100" }]);
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);

      expect(mockGetShareholders).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Check the statement of capital");
      expect(response.text).toContain("Is the statement of capital correct?");
      expect(response.text).not.toContain(SHARES_TOTALS_INVALID_WARNING);
      expect(response.text).not.toContain(UNPAID_AMOUNT_NULL_WARNING);
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

    it("should navigate to the statement of capital page and display the total value as a product of 'Number of shares' and 'Value of shares'", async () => {
      mockGetStatementOfCapitalData.mockResolvedValueOnce({
        numberAllotted: "110",
        aggregateNominalValue: "2"
      });
      mockGetShareholders.mockResolvedValue([{ shares: "123" }]);
      const response = await request(app).get(STATEMENT_OF_CAPITAL_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Check the statement of capital");
      expect(response.text).toContain("220");
    });
  });

  describe("post tests", () => {
    it("Should navigate to the task list page when statement of capital confirmed and set status to CONFIRMED.", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ statementOfCapital: "yes" })
        .send({ sharesValidation: "true" })
        .send({ totalAmountUnpaidValidation: "false" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
    });

    it("Should navigate to the task list page when recently filed button is selected", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ statementOfCapital: "recently_filed" })
        .send({ sharesValidation: "true" })
        .send({ totalAmountUnpaidValidation: "false" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
    });

    it("Should navigate to the statement of capital stop page when the ONLY statement of capital validation has failed.", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ sharesValidation: "false" })
        .send({ totalAmountUnpaidValidation: "true" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
    });

    it("Should navigate to the statement of capital stop page when ONLY the total amount unpaid is NULL.", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ sharesValidation: "true" })
        .send({ totalAmountUnpaidValidation: "false" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
    });

    it("Should navigate to the statement of capital stop page when BOTH the statement of capital validation has failed and the total amount unpaid is NULL.", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ sharesValidation: "false" })
        .send({ totalAmountUnpaidValidation: "false" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
    });

    it("Should navigate to the statement of capital stop page when statement of capital is declared incorrect", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ statementOfCapital: "no" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
    });

    it("Should redisplay statement of capital page with error when radio button is not selected", async () => {
      const response = await request(app)
        .post(STATEMENT_OF_CAPITAL_URL)
        .send({ sharesValidation: 'true' })
        .send({ totalAmountUnpaidValidation: 'true' });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(STATEMENT_OF_CAPITAL_ERROR);
      expect(response.text).toContain("Check the statement of capital");
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlWithCompanyNumberTransactionIdAndSubmissionId = jest.spyOn(urlUtils, "getUrlWithCompanyNumberTransactionIdAndSubmissionId");
      spyGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(STATEMENT_OF_CAPITAL_URL);

      expect(response.text).toContain("Sorry, the service is unavailable");

      // restore original function so it is no longer mocked
      spyGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mockRestore();
    });
  });
});
