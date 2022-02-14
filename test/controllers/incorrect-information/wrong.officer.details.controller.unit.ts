import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  ACTIVE_OFFICERS_DETAILS_PATH,
  WRONG_DETAILS_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const WRONG_OFFICER_PAGE_HEADING = "Incorrect Officer Details";
const STOP_PAGE_HEADING = "Update the officer details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongShareholdersPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_DETAILS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);


describe("Wrong details stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong details stop page", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_OFFICERS_DETAILS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongShareholdersPath);

      expect(response.text).toContain(WRONG_OFFICER_PAGE_HEADING);
      expect(response.text).toContain(STOP_PAGE_HEADING);
      expect(response.text).toContain(backLinkUrl);
    });
  });
});
