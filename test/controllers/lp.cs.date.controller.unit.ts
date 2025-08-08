import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { LP_CS_DATE_PATH, urlParams } from "../../src/types/page.urls";

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = LP_CS_DATE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("start confirmation statement date controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return limited partnership confirmation statement date page", async () => {
    const response = await request(app).get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain("Confirmation statement date");
  });

  it("should redirect to check your answer page", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({
        "confirmationStatementDate": "yes",
        "csDate-year": "2025",
        "csDate-month": "08",
        "csDate-day": "01"
      });

    expect(response.headers.location).toBe("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/check-your-answer?lang=en");
  });

  it("should show error message when the entire CS date is missing", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({
        "confirmationStatementDate": "yes"
      });

    expect(response.text).toContain("Error: Please enter the confirmation statement date");
  });

  it("should show error message when the year of CS date is missing", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({
        "confirmationStatementDate": "yes",
        "csDate-month": "08",
        "csDate-day": "01"
      });

    expect(response.text).toContain("Error: Please enter the confirmation statement date");
  });

  it("should forward to sic code page", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({ "confirmationStatementDate": "no" });

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.status).toBe(302); // Expecting a redirect response
    expect(response.headers.location).toBe("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/sic-code-summary?lang=en");
  });
});
