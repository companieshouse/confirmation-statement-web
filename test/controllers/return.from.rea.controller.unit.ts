jest.mock("../../src/utils/update.confirmation.statement.submission");

import request from "supertest";
import { NextFunction, Request, Response } from "express";
import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import { RETURN_FROM_REA_PATH, CHECK_EMAIL_ADDRESS_PATH, TASK_LIST_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { SECTIONS } from "../../src/utils/constants";
import { sendUpdate } from "../../src/utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { session } from "../mocks/session.middleware.mock";

const mockSendUpdate = sendUpdate as jest.Mock;

const EXPECTED_ERROR_TEXT = "Sorry, there is a problem with the service";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";

const RETURN_FROM_REA_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(RETURN_FROM_REA_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const CHECK_EMAIL_ADDRESS_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CHECK_EMAIL_ADDRESS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const TASK_LIST_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

describe("Return from REA controller GET tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockSendUpdate.mockClear();
  });

  it("Should navigate to the Check registered email address page if email has not been submitted", async () => {
    mocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.session = session;
      req.session.data.extra_data["registeredEmailAddressSubmitted"] = false;
      req.session.data.extra_data["companyNumber"] = COMPANY_NUMBER;
      next();
    });
    const response = await request(app).get(RETURN_FROM_REA_URL);

    expect(mockSendUpdate.mock.calls.length).toBe(0);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(CHECK_EMAIL_ADDRESS_URL);
  });

  it("Should navigate to the Task list page and update section status if email has been submitted", async () => {
    mocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
      req.session = session;
      req.session.data.extra_data["registeredEmailAddressSubmitted"] = true;
      req.session.data.extra_data["companyNumber"] = COMPANY_NUMBER;
      next();
    });

    const response = await request(app).get(RETURN_FROM_REA_URL);

    expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.EMAIL);
    expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.RECENT_FILING);
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(TASK_LIST_URL);
  });

  it("Should redirect to an error page when error is thrown", async () => {
    const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(RETURN_FROM_REA_URL);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    // restore original function so it is no longer mocked
    spyGetUrlToPath.mockRestore();
  });

});
