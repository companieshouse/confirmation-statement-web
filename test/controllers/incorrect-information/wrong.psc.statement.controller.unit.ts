import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  ACTIVE_PSC_DETAILS_PATH,
  WRONG_PSC_STATEMENT_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const WRONG_PSC_PAGE_HEADING = "Incorrect PSC Details";
const STOP_PAGE_HEADING = "Update the people with significant control (PSC) details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongShareholdersPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_PSC_STATEMENT_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);


describe("Wrong psc statement stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the stop page for the wrong psc statement", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_PSC_DETAILS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongShareholdersPath);

      expect(response.text).toContain(WRONG_PSC_PAGE_HEADING);
      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(response.text).toContain(backLinkUrl);
    });
  });
});
