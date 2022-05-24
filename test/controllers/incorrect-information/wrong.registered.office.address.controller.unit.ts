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
import * as updateConfirmationStatement from "../../../src/utils/update.confirmation.statement.submission";
import { RADIO_BUTTON_VALUE } from "../../../src/utils/constants";

const STOP_PAGE_TEXT = "You need to update the company details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongRegisteredOfficeAddressPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_RO_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const TASK_LIST_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const WRONG_ROA_ERROR = "Select yes if you have updated the registered office address";
const WRONG_ROA_PAGE_HEADING = "Incorrect registered office address - File a confirmation statement";
const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";

describe("Wrong registered office address stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong registered office address stop page", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTERED_OFFICE_ADDRESS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const changeRoaUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CHANGE_ROA_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongRegisteredOfficeAddressPath);

      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(WRONG_ROA_PAGE_HEADING);
      expect(response.text).toContain(backLinkUrl);
      expect(response.text).toContain(changeRoaUrl);
    });
  });

  describe("tests for the post function", () => {

    it("Should redisplay wrong ROA stop screen with error when radio button is not selected", async () => {
      const changeRoaUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CHANGE_ROA_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTERED_OFFICE_ADDRESS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).post(populatedWrongRegisteredOfficeAddressPath);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_ROA_PAGE_HEADING);
      expect(response.text).toContain(WRONG_ROA_ERROR);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrl);
      expect(response.text).toContain(changeRoaUrl);
    });

    it("Should redirect to task list page when yes radio button is selected", async () => {
      const mockSendUpdate = jest.spyOn(updateConfirmationStatement, "sendUpdate");
      mockSendUpdate.mockReturnValue(undefined);
      const response = await request(app).post(populatedWrongRegisteredOfficeAddressPath).send({ radioButton: RADIO_BUTTON_VALUE.YES });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      mockSendUpdate.mockRestore();
    });

    it("Should redirect to task list page when no radio button is selected", async () => {
      const mockSendUpdate = jest.spyOn(updateConfirmationStatement, "sendUpdate");
      mockSendUpdate.mockReturnValue(undefined);
      const response = await request(app).post(populatedWrongRegisteredOfficeAddressPath).send({ radioButton: RADIO_BUTTON_VALUE.NO });
      
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      mockSendUpdate.mockRestore();
    });

    it("Should return error page when radio button id is not valid", async () => {
      const response = await request(app)
        .post(populatedWrongRegisteredOfficeAddressPath)
        .send({ radioButton: "malicious code block" });

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(populatedWrongRegisteredOfficeAddressPath);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });

  });
});
