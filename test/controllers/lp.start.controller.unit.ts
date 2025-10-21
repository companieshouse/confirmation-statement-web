import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { NextFunction, Request, Response } from "express";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { Session } from "@companieshouse/node-session-handler";
import { ACSP_LIMITED_PARTNERSHIP_PATH, urlParams } from "../../src/types/page.urls";


const EXPECTED_TEXT = "limited partnership landing page";
const TEST_EMAIL = "user-name@companieshouse.gov.uk";

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  const session: Session = new Session();
  session.data = {
    signin_info: {
      user_profile: {
        email: TEST_EMAIL,
      },
    },
  };
  req.session = session;
  return next();
});


const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "trans-12345";
const SUBMISSION_ID = "sub-12345";
const URL = ACSP_LIMITED_PARTNERSHIP_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return limited partnership start page", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain(EXPECTED_TEXT);
  });

  it("limited partnership start page should contain a header", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain('govuk-header');
  });

  it("limited partnership header should contain a service navigation", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain('govuk-service-navigation');
    expect(response.text).toContain('File a limited partnership confirmation statement');
  });

  it("limited partnership header should contain a phase banner", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain('govuk-phase-banner');
    expect(response.text).toContain('This is a new service – ');
  });

  it("limited partnership header should contain sign out lists", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain(TEST_EMAIL);
    expect(response.text).toContain('Sign out');
  });

  it("limited partnership header should contain a back button", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain('govuk-back-link');
  });

  // Removed since disabling welsh translation - CSE-881
  // it("limited partnership header should contain a language list", async () => {
  //   const response = await request(app)
  //     .get(URL);

  //   expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  //   expect(response.text).toContain('English');
  //   expect(response.text).toContain('Cymraeg');
  // });

  it("limited partnership start page should contain a footer", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain('govuk-footer');
  });

  it("should contain a start button", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain('id="start-now"');
    expect(response.text).toContain('Start now');
  });

  it("should redirect to before-you-file on form submission", async () => {
    const response = await request(app)
      .post(URL)
      .send();

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.status).toBe(302); // Expecting a redirect response
    expect(response.headers.location).toBe("/confirmation-statement/company/12345678/transaction/trans-12345/submission/sub-12345/acsp/before-you-file?lang=en");
  });
});
