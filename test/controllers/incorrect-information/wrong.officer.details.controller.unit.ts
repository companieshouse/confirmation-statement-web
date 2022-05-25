import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  ACTIVE_OFFICERS_DETAILS_PATH,
  TASK_LIST_PATH,
  WRONG_OFFICER_DETAILS_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { RADIO_BUTTON_VALUE } from "../../../src/utils/constants";
import * as updateConfirmationStatement from "../../../src/utils/update.confirmation.statement.submission";

const WRONG_OFFICER_PAGE_HEADING = "Update officers - File a confirmation statement";
const RADIO_LEGEND = "Have you updated the officer details?";
const STOP_PAGE_TEXT = "You need to update the company details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongOfficerDetailsPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_OFFICER_DETAILS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const TASK_LIST_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";
const WRONG_OFFICER_ERROR = "Select yes if you have updated the officer details";


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
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrl);
    });
  });

  describe("tests for the post function", () => {

    it("Should redisplay wrong officer details stop screen with error when radio button is not selected", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_OFFICERS_DETAILS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).post(populatedWrongOfficerDetailsPath);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_OFFICER_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(WRONG_OFFICER_ERROR);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrl);
    });

    it("Should redirect to task list page when yes radio button is selected", async () => {
      const mockSendUpdate = jest.spyOn(updateConfirmationStatement, "sendUpdate");
      mockSendUpdate.mockReturnValue(undefined);
      const response = await request(app).post(populatedWrongOfficerDetailsPath).send({ radioButton: RADIO_BUTTON_VALUE.YES });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      mockSendUpdate.mockRestore();
    });

    it("Should redirect to task list page when no radio button is selected", async () => {
      const mockSendUpdate = jest.spyOn(updateConfirmationStatement, "sendUpdate");
      mockSendUpdate.mockReturnValue(undefined);
      const response = await request(app).post(populatedWrongOfficerDetailsPath).send({ radioButton: RADIO_BUTTON_VALUE.NO });
      
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      mockSendUpdate.mockRestore();
    });

    it("Should return error page when radio button id is not valid", async () => {
      const response = await request(app)
        .post(populatedWrongOfficerDetailsPath)
        .send({ radioButton: "malicious code block" });

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(populatedWrongOfficerDetailsPath);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });

  });
});
