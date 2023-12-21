jest.mock("../../../src/services/statement.of.capital.service");
jest.mock("../../../src/controllers/tasks/statement.of.capital.controller");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  STATEMENT_OF_CAPITAL_PATH,
  WRONG_STATEMENT_OF_CAPITAL_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import {
  getStatementOfCapitalData,
  validateTotalNumberOfShares
} from "../../../src/services/statement.of.capital.service";


const mockGetStatementOfCapitalData = getStatementOfCapitalData as jest.Mock;
const mockValidateTotalNumberOfShares = validateTotalNumberOfShares as jest.Mock;

const STOP_PAGE_HEADING = "Incorrect SOC";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongStatementOfCapitalPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_STATEMENT_OF_CAPITAL_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";

describe("Wrong statement of capital stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetStatementOfCapitalData.mockClear();
    mockValidateTotalNumberOfShares.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong statement of capital stop page for when ONLY statement of capital validation has failed.", async () => {
      mockGetStatementOfCapitalData.mockReturnValueOnce({
        totalAmountUnpaidForCurrency: ""
      });
      mockValidateTotalNumberOfShares.mockReturnValueOnce(false);
      const response = await request(app).get(populatedWrongStatementOfCapitalPath);

      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(response.text).toContain("The company's share capital does not match the shares held by its shareholders.");
      expect(response.text).toContain(backLinkUrl);
    });

    it("Should render wrong statement of capital stop page for when ONLY the total amount unpaid is NULL.", async () => {
      mockGetStatementOfCapitalData.mockReturnValueOnce({
      });
      mockValidateTotalNumberOfShares.mockReturnValueOnce(true);
      const response = await request(app).get(populatedWrongStatementOfCapitalPath);

      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(response.text).toContain("The total amount unpaid for all shares is missing on this company’s statement of capital.");
      expect(response.text).toContain(backLinkUrl);
    });

    it("Should render wrong statement of capital stop page for when BOTH are false.", async () => {
      mockGetStatementOfCapitalData.mockReturnValueOnce({
      });
      mockValidateTotalNumberOfShares.mockReturnValueOnce(false);
      const response = await request(app).get(populatedWrongStatementOfCapitalPath);

      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(response.text).toContain("The company's share capital does not match the shares held by its shareholders.");
      expect(response.text).toContain("The total amount unpaid for all shares is missing on this company’s statement of capital.");
      expect(response.text).toContain(backLinkUrl);
    });

    it("Should throw an error if statement of capital lookup throws an error", async () => {
      mockGetStatementOfCapitalData.mockRejectedValueOnce(new Error());
      const response = await request(app).get(populatedWrongStatementOfCapitalPath);
      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    });

  });
});
