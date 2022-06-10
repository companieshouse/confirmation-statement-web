import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { SIC_PATH, WRONG_SIC_PATH } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const STOP_PAGE_TEXT = "You must update this information by filing a confirmation statement through";
const SIC_CODE = "123";
const SIC_CODE_DESCRIPTIONS = "Test SIC code descriptions";
const SIC_CODE_DETAILS = "<strong>" + SIC_CODE + "</strong> - " + SIC_CODE_DESCRIPTIONS;
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongSicPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_SIC_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

describe("Wrong sic stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong sic stop page", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(SIC_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongSicPath);

      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).not.toContain(SIC_CODE_DETAILS);
      expect(response.text).toContain("Incorrect SIC");
      expect(response.text).toContain(backLinkUrl);
    });
  });
});
