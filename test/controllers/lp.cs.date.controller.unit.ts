import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { LP_CS_DATE_PATH, urlParams } from "../../src/types/page.urls";
import * as limitedPartnershipUtils from "../../src/utils/limited.partnership";
import { validLimitedPartnershipProfile } from "../mocks/company.profile.mock";
import { getCompanyProfileFromSession } from "../../src/utils/session";
import { getAcspSessionData } from "../../src/utils/session.acsp";
import { sendLimitedPartnershipTransactionUpdate } from "../../src/utils/confirmation/limited.partnership.confirmation.ts";

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = LP_CS_DATE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_TITLE_ERROR = "Error: Confirmation statement date";

jest.mock("../../src/utils/session.acsp");
jest.mock("../../src/utils/session");
const mockGetCompanyProfileFromSession = getCompanyProfileFromSession as jest.Mock;

jest.mock("../../src/utils/confirmation/limited.partnership.confirmation.ts");
const mockSendLimitedPartnershipTransactionUpdate = sendLimitedPartnershipTransactionUpdate as jest.Mock;

jest.mock("../../src/utils/limited.partnership", () => ({
  isACSPJourney: jest.fn(),
  isPflpLimitedPartnershipCompanyType: jest.fn(),
  isSpflpLimitedPartnershipCompanyType: jest.fn(),
  getReviewPath: jest.fn()
}));

describe("start confirmation statement date controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompanyProfileFromSession.mockReturnValue(validLimitedPartnershipProfile);
    mockSendLimitedPartnershipTransactionUpdate.mockClear();
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

    expect(mockSendLimitedPartnershipTransactionUpdate.mock.calls[0][1]).toBe("2025-08-01");
    expect(response.headers.location).toBe("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/check-your-answer?lang=en");
  });

  it("should show error message when the entire CS date is missing", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({
        "confirmationStatementDate": "yes"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Enter the new confirmation statement date");
  });

  it("should show error message when the year of CS date is missing", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({
        "confirmationStatementDate": "yes",
        "csDate-month": "08",
        "csDate-day": "01"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Confirmation statement date must include a year");
  });

  it("should show error message when the CS date is valid", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({
        "confirmationStatementDate": "yes",
        "csDate-year": "2025",
        "csDate-month": "02",
        "csDate-day": "31"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Confirmation statement date must be a real date");
  });

  it("should forward to sic code page", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({ "confirmationStatementDate": "no" });

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.status).toBe(302); // Expecting a redirect response
    expect(response.headers.location).toBe("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/sic-code-summary?lang=en");
  });

  it("should return on time screen if LP CS date is already late", async () => {
    const response = await request(app).get(URL);

    expect(response.text).toContain("Confirmation statement date");
    expect(response.text).toContain("The date of this confirmation statement is:  <b>15 March 2020</b>");
    expect(response.text).toContain("You must file it by: <b>29 March 2020</b>");
    expect(response.text).toContain("No");
  });

  it("should return early screen if today is before LP CS file date", async () => {

    (getAcspSessionData as jest.Mock).mockReturnValue({
      newConfirmationDate: new Date("2025-09-03")
    });
    mockGetCompanyProfileFromSession.mockReturnValue({
      companyName: "Test Limited Partnership",
      companyNumber: "LP123456",
      confirmationStatement: {
        nextMadeUpTo: "2999-09-01",
      },
    });
    const response = await request(app).get(URL);

    expect(response.text).toContain("Confirmation statement date");
    expect(response.text).toContain("You are not due to file a confirmation statement yet");
    expect(response.text).toContain("The date of your next expected confirmation statement is  <b>1 September 2999</b>");
    expect(response.text).toContain("No, I want to use today&#39;s date -");
  });
});

describe("date controller post tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getCompanyProfileFromSession as jest.Mock).mockResolvedValue({
      companyNumber: COMPANY_NUMBER,
      type: "limited-partnership",
      subtype: "limited-partnership",
      companyName: "Test Company"
    });

    (limitedPartnershipUtils.isACSPJourney as jest.Mock).mockReturnValue(true);
    (limitedPartnershipUtils.isPflpLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(false);
    (limitedPartnershipUtils.isSpflpLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(false);
    (limitedPartnershipUtils.getReviewPath as jest.Mock).mockReturnValue("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/review");
  });

  it("should redirect to SIC Summary page when 'no' is selected and company type is not pflp/spflp", async () => {
    const response = await request(app)
      .post(URL)
      .send({ confirmationStatementDate: "no" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`/confirmation-statement/company/${COMPANY_NUMBER}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/acsp/sic-code-summary?lang=en`);
  });

  it("should redirect to Review page when 'no' is selected and company type is pflp", async () => {
    (limitedPartnershipUtils.isPflpLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(true);

    const response = await request(app)
      .post(URL)
      .send({ confirmationStatementDate: "no" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`/confirmation-statement/company/${COMPANY_NUMBER}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/acsp/review?lang=en`);
  });

  it("should redirect to previous page when back button clicked", async () => {
    const response = await request(app).get(URL);

    const expectedBackUrl = `/confirmation-statement/company/${COMPANY_NUMBER}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/acsp/before-you-file?lang=en`;

    expect(response.status).toBe(200);
    expect(response.text).toContain(`href="${expectedBackUrl}"`);
  });

});


describe("date controller validation tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (getCompanyProfileFromSession as jest.Mock).mockResolvedValue({
      companyNumber: COMPANY_NUMBER,
      type: "limited-partnership",
      subtype: "limited-partnership",
      companyName: "Test Company"
    });

    (limitedPartnershipUtils.isACSPJourney as jest.Mock).mockReturnValue(true);
    (limitedPartnershipUtils.isPflpLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(false);
    (limitedPartnershipUtils.isSpflpLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(false);
    (limitedPartnershipUtils.getReviewPath as jest.Mock).mockReturnValue("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/review");
  });

  it("should show error when CS day contains non-numeric values", async () => {
    const response = await request(app)
      .post(URL)
      .send({
        confirmationStatementDate: "yes",
        "csDate-day": "aa",
        "csDate-month": "01",
        "csDate-year": "2025"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Confirmation statement date must be a real date");
  });

  it("should show error when CS month contains non-numeric values", async () => {
    const response = await request(app)
      .post(URL)
      .send({
        confirmationStatementDate: "yes",
        "csDate-day": "01",
        "csDate-month": "aa",
        "csDate-year": "2025"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Confirmation statement date must be a real date");
  });

  it("should show error when CS year contains non-numeric values", async () => {
    const response = await request(app)
      .post(URL)
      .send({
        confirmationStatementDate: "yes",
        "csDate-day": "01",
        "csDate-month": "01",
        "csDate-year": "cccc"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Confirmation statement date must be a real date");
  });

  it("should show error when CS date is missing day and month", async () => {
    const response = await request(app)
      .post(URL)
      .send({
        confirmationStatementDate: "yes",
        "csDate-year": "2025"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Confirmation statement date must include a day");
  });

  it("should show error for invalid leap year date", async () => {
    const response = await request(app)
      .post(URL)
      .send({
        confirmationStatementDate: "yes",
        "csDate-day": "29",
        "csDate-month": "02",
        "csDate-year": "2023"
      });

    expect(response.text).toContain(PAGE_TITLE_ERROR);
    expect(response.text).toContain("Confirmation statement date must be a real date");
  });

  it("should accept valid leap year date", async () => {
    const response = await request(app)
      .post(URL)
      .send({
        confirmationStatementDate: "yes",
        "csDate-day": "29",
        "csDate-month": "02",
        "csDate-year": "2024"
      });

    expect(mockSendLimitedPartnershipTransactionUpdate.mock.calls[0][1]).toBe("2024-02-29");
    expect(response.status).toBe(302);
  });

});
