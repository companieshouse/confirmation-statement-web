import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { LP_CHECK_YOUR_ANSWER_PATH, urlParams } from "../../src/types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { createDefaultAcspSessionData } from "../../src/utils/session.acsp";

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = LP_CHECK_YOUR_ANSWER_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const csDatePageUrl = "/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/confirmation-statement-date?lang=en";
const csDate = new Date("2025-08-01:00:00Z");
const acspSessionData = createDefaultAcspSessionData();

middlewareMocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  const session: Session = new Session();
  session.data = {
    extra_data: {
      acsp_session: acspSessionData
    }
  };
  req.session = session;
  return next();
});

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("system should return CS date page if the value of changeConfirmationStatementDate and newConfirmationDate are null", async () => {
    acspSessionData.changeConfirmationStatementDate = null;
    acspSessionData.newConfirmationDate = null;
    const response = await request(app).get(URL);

    expect(response.headers.location).toBe(csDatePageUrl);
  });

  it("system should return check your answer page if the value of changeConfirmationStatementDate is true and newConfirmationDate have value", async () => {
    acspSessionData.changeConfirmationStatementDate = true;
    acspSessionData.newConfirmationDate = csDate;

    const response = await request(app).get(URL);

    expect(response.text).toContain("Confirmation statement date");
    expect(response.text).toContain("1 August 2025");
  });

  it("system should return CS date page if the value of changeConfirmationStatementDate is null and newConfirmationDate have value", async () => {
    acspSessionData.changeConfirmationStatementDate = null;
    acspSessionData.newConfirmationDate = csDate;
    const response = await request(app).get(URL);

    expect(response.headers.location).toBe(csDatePageUrl);
  });

  it("system should return CS date page if the value of changeConfirmationStatementDate is false and newConfirmationDate have value", async () => {
    acspSessionData.changeConfirmationStatementDate = false;
    acspSessionData.newConfirmationDate = csDate;
    const response = await request(app).get(URL);

    expect(response.headers.location).toBe(csDatePageUrl);
  });

  it("system should return CS date page if the value of changeConfirmationStatementDate is true and newConfirmationDate is null", async () => {
    acspSessionData.changeConfirmationStatementDate = true;
    acspSessionData.newConfirmationDate = null;
    const response = await request(app).get(URL);

    expect(response.headers.location).toBe(csDatePageUrl);
  });

  it("should redirect to previous page when back button clicked", async () => {
    acspSessionData.changeConfirmationStatementDate = true;
    acspSessionData.newConfirmationDate = csDate;
    const response = await request(app).get(URL);

    const expectedBackUrl = `/confirmation-statement/company/${COMPANY_NUMBER}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/acsp/confirmation-statement-date?lang=en`;

    expect(response.status).toBe(200);
    expect(response.text).toContain(`href="${expectedBackUrl}"`);
  });
});
