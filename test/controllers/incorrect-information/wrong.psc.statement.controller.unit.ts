jest.mock("../../../src/services/psc.service");
jest.mock("../../../src/utils/update.confirmation.statement.submission");
jest.mock("../../../src/services/confirmation.statement.service");
jest.mock("../../../src/utils/api.enumerations");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  PSC_STATEMENT_PATH,
  TASK_LIST_PATH,
  URL_QUERY_PARAM,
  WRONG_PSC_STATEMENT_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { RADIO_BUTTON_VALUE, SECTIONS } from "../../../src/utils/constants";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";
import { getPscs } from "../../../src/services/psc.service";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { mockPscList } from "../../mocks/active.psc.details.controller.mock";

const WRONG_PSC_PAGE_HEADING = "Incorrect people with significant control - File a confirmation statement";
const RADIO_LEGEND = "Have you updated the PSC details?";
const STOP_PAGE_TEXT = "You need to update the company details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "12345-12345";
const SUBMISSION_ID = "86dfssfds";
const populatedWrongPscStatementPath = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(WRONG_PSC_STATEMENT_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const TASK_LIST_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";
const WRONG_PSC_ERROR = "Select yes if you have updated the PSC details";
const PSC_STATEMENT_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PSC_STATEMENT_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const backLinkUrlTrue = urlUtils.setQueryParam(PSC_STATEMENT_URL, URL_QUERY_PARAM.IS_PSC, "true");
const backLinkUrlFalse = urlUtils.setQueryParam(PSC_STATEMENT_URL, URL_QUERY_PARAM.IS_PSC, "false");

const mockSendUpdate = sendUpdate as jest.Mock;
const mockGetPscs = getPscs as jest.Mock;

describe("Wrong psc statement stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetPscs.mockClear();
    mockSendUpdate.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the stop page for the wrong psc statement with the param isPsc in the back link url set to true if Psc are found", async () => {
      mockGetPscs.mockResolvedValueOnce(mockPscList);
      const response = await request(app).get(populatedWrongPscStatementPath);

      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(TRANSACTION_ID);
      expect(response.text).toContain(WRONG_PSC_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrlTrue);
    });

    it("Should render the stop page for the wrong psc statement with the param isPsc in the back link url set to false if no Psc is found", async () => {
      mockGetPscs.mockResolvedValueOnce([ ]);
      const response = await request(app).get(populatedWrongPscStatementPath);

      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(TRANSACTION_ID);
      expect(response.text).toContain(WRONG_PSC_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrlFalse);
    });

    it("Should render the stop page for the wrong psc statement with the param isPsc in the back link url set to false if Pscs are undefined", async () => {
      mockGetPscs.mockResolvedValueOnce(undefined);
      const response = await request(app).get(populatedWrongPscStatementPath);

      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(TRANSACTION_ID);
      expect(response.text).toContain(WRONG_PSC_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrlFalse);
    });

    it("Should return an error page if error is thrown in get function", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).get(populatedWrongPscStatementPath);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });
  });

  describe("tests for the post function", () => {

    it("Should redisplay wrong PSC statement stop screen with error when radio button is not selected, with the param isPsc in the back link url set to true if Psc are found", async () => {
      mockGetPscs.mockResolvedValueOnce(mockPscList);
      const response = await request(app).post(populatedWrongPscStatementPath);

      expect(response.status).toEqual(200);
      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(TRANSACTION_ID);
      expect(response.text).toContain(WRONG_PSC_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(WRONG_PSC_ERROR);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrlTrue);
    });

    it("Should redisplay wrong PSC statement stop screen with error when radio button is not selected, with the param isPsc in the back link url set to false if Psc are not found", async () => {
      mockGetPscs.mockResolvedValueOnce([ ]);
      const response = await request(app).post(populatedWrongPscStatementPath);

      expect(response.status).toEqual(200);
      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(TRANSACTION_ID);
      expect(response.text).toContain(WRONG_PSC_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(WRONG_PSC_ERROR);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrlFalse);
    });

    it("Should redisplay wrong PSC statement stop screen with error when radio button is not selected, with the param isPsc in the back link url set to false if Pscs are undefined", async () => {
      mockGetPscs.mockResolvedValueOnce(undefined);
      const response = await request(app).post(populatedWrongPscStatementPath);

      expect(response.status).toEqual(200);
      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(TRANSACTION_ID);
      expect(response.text).toContain(WRONG_PSC_PAGE_HEADING);
      expect(response.text).toContain(RADIO_LEGEND);
      expect(response.text).toContain(WRONG_PSC_ERROR);
      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).toContain(backLinkUrlFalse);
    });

    it("Should redirect to task list page when radio button YES is selected", async () => {
      const response = await request(app)
        .post(populatedWrongPscStatementPath)
        .send({ radioButton: RADIO_BUTTON_VALUE.YES });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.PSC);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.RECENT_FILING);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should redirect to task list page when radio button NO is selected", async () => {
      const response = await request(app)
        .post(populatedWrongPscStatementPath)
        .send({ radioButton: RADIO_BUTTON_VALUE.NO });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.PSC);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should return error page when radio button id is not valid", async () => {
      const response = await request(app)
        .post(populatedWrongPscStatementPath)
        .send({ radioButton: "malicious code block" });

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(populatedWrongPscStatementPath);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(ERROR_PAGE_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });

  });
});
