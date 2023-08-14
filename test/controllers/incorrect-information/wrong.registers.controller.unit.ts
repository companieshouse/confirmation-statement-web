jest.mock("../../../src/utils/update.confirmation.statement.submission");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  REGISTER_LOCATIONS_PATH,
  TASK_LIST_PATH,
  WRONG_REGISTER_LOCATIONS_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { RADIO_BUTTON_VALUE, SECTIONS } from "../../../src/utils/constants";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const STOP_PAGE_TEXT = "You need to update the company details";
const WRONG_REGISTER_PAGE_HEADING = "Incorrect register - File a confirmation statement";
const WRONG_REGISTER_ERROR = "Select yes if you have updated where the company records are kept";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongRegisterLocationsAddressPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_REGISTER_LOCATIONS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const TASK_LIST_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";

const mockSendUpdate = sendUpdate as jest.Mock;

describe("Wrong register locations stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockSendUpdate.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong register locations stop page", async () => {
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTER_LOCATIONS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
      const response = await request(app).get(populatedWrongRegisterLocationsAddressPath);

      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(WRONG_REGISTER_PAGE_HEADING);
      expect(response.text).toContain(backLinkUrl);
    });
  });

  describe("tests for the post function", () => {

    it("Should redisplay wrong registers stop screen with error when radio button is not selected", async () => {
      const response = await request(app).post(populatedWrongRegisterLocationsAddressPath);
      const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTER_LOCATIONS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_REGISTER_PAGE_HEADING);
      expect(response.text).toContain(WRONG_REGISTER_ERROR);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrl);
    });

    it("Should redirect to task list page when yes radio button is selected", async () => {
      const response = await request(app).post(populatedWrongRegisterLocationsAddressPath).send({ radioButton: RADIO_BUTTON_VALUE.YES });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.REGISTER_LOCATIONS);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.RECENT_FILING);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should redirect to task list page when no radio button is selected", async () => {
      const response = await request(app).post(populatedWrongRegisterLocationsAddressPath).send({ radioButton: RADIO_BUTTON_VALUE.NO });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.REGISTER_LOCATIONS);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should return error page when radio button id is not valid", async () => {
      const response = await request(app)
        .post(populatedWrongRegisterLocationsAddressPath)
        .send({ radioButton: "malicious code block" });

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(populatedWrongRegisterLocationsAddressPath);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });

  });
});
