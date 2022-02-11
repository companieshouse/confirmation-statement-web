import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  CHANGE_ROA_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  TASK_LIST_PATH,
  WRONG_RO_PATH

} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const STOP_PAGE_TEXT = "You need to update the company details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongRegisteredOfficeAddressPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_RO_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

describe("Wrong registered office address stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong registered office address stop page", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTERED_OFFICE_ADDRESS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const taskListUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const changeRoaUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CHANGE_ROA_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongRegisteredOfficeAddressPath);

      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain("Incorrect registered office address - File a confirmation statement");
      expect(response.text).toContain(backLinkUrl);
      expect(response.text).toContain(taskListUrl);
      expect(response.text).toContain(changeRoaUrl);
    });
  });
});
