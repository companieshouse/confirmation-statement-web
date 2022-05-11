import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  ACTIVE_OFFICERS_DETAILS_PATH,
  WRONG_OFFICER_DETAILS_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const WRONG_OFFICER_PAGE_HEADING = "Incorrect Officer Details";
const RADIO_LEGEND = "Have you updated the officer details?";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongOfficerDetailsPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_OFFICER_DETAILS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);


describe("Wrong officer details stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the stop page for the wrong officer details", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_OFFICERS_DETAILS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongOfficerDetailsPath);

      expect(response.text).toContain(WRONG_OFFICER_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(backLinkUrl);
    });
  });
});
