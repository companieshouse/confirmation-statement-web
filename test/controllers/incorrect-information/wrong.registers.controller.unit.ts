import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  REGISTER_LOCATIONS_PATH,
  TASK_LIST_PATH,
  WRONG_REGISTER_LOCATIONS_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const STOP_PAGE_TEXT = "You will need to update the company details";
const WRONG_REGISTER_PAGE_HEADING = "Incorrect register - File a confirmation statement";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongRegisterLocationsAddressPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_REGISTER_LOCATIONS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

describe("Wrong register locations stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong register locations stop page", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTER_LOCATIONS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const taskListUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongRegisterLocationsAddressPath);

      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(WRONG_REGISTER_PAGE_HEADING);
      expect(response.text).toContain(backLinkUrl);
      expect(response.text).toContain(taskListUrl);
    });
  });
});
