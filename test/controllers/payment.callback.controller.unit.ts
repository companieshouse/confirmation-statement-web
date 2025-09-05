import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import { urlUtils } from "../../src/utils/url";
import { PAYMENT_CALLBACK_PATH } from "../../src/types/page.urls";


const COMPANY_NUMBER = "12345678";
const CONFIRMATION_PAGE_HEADING = "Found. Redirecting to /confirmation-statement/company/12345678/transaction/66454/submission/435435/body/confirmation";
const REVIEW_PAGE_HEADING = "Found. Redirecting to /confirmation-statement/company/12345678/transaction/66454/submission/435435/body/review";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL =
    urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PAYMENT_CALLBACK_PATH,
                                                                 COMPANY_NUMBER,
                                                                 TRANSACTION_ID,
                                                                 SUBMISSION_ID);

describe("Payment callback controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show confirmation page for successful payment", async () => {
    const successUrl = URL + "?ref=CS_REFERENCE&state=123456&status=paid";
    const response = await request(app)
      .get(successUrl);

    expect(response.status).toBe(302);
    expect(response.text).toContain(CONFIRMATION_PAGE_HEADING);
    expect(response.text).not.toContain(REVIEW_PAGE_HEADING);
    expect(response.text).toContain(TRANSACTION_ID);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should show review page for declined payment", async () => {
    const declinedUrl = URL + "?ref=CS_REFERENCE&state=123456&status=failed";
    const response = await request(app)
      .get(declinedUrl);

    expect(response.status).toBe(302);
    expect(response.text).not.toContain(CONFIRMATION_PAGE_HEADING);
    expect(response.text).toContain(REVIEW_PAGE_HEADING);
    expect(response.text).toContain(TRANSACTION_ID);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should show review page for cancelled payment", async () => {
    const cancelledUrl = URL + "?ref=CS_REFERENCE&state=123456&status=cancelled";
    const response = await request(app)
      .get(cancelledUrl);

    expect(response.status).toBe(302);
    expect(response.text).not.toContain(CONFIRMATION_PAGE_HEADING);
    expect(response.text).toContain(REVIEW_PAGE_HEADING);
    expect(response.text).toContain(TRANSACTION_ID);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should error if state doesn't match session state", async () => {
    const successUrl = URL + "?ref=CS_REFERENCE&state=654321&status=paid";
    const response = await request(app)
      .get(successUrl);

    expect(response.status).toBe(500);
    expect(response.text).toContain("Sorry, there is a problem with the service");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });
});
