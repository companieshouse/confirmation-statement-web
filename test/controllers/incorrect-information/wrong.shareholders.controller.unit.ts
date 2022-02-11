import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { SHAREHOLDERS_PATH, WRONG_SHAREHOLDERS_PATH } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const STOP_PAGE_TEXT = "Currently, changes to shareholder details can only be made by filing a confirmation statement";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongShareholdersPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_SHAREHOLDERS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

describe("Wrong shareholders stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong shareholders stop page", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(SHAREHOLDERS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongShareholdersPath);

      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain("Incorrect Shareholder Details");
      expect(response.text).toContain(backLinkUrl);
    });
  });
});
