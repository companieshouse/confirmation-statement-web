import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import { urlUtils } from "../../src/utils/url";
import { CONFIRMATION_PATH } from "../../src/types/page.urls";


const COMPANY_NUMBER = "12345678";
const CONFIRMATION_PAGE_HEADING = "Confirmation";
const REVIEW_PAGE_HEADING = "Found. Redirecting to /confirmation-statement/company/12345678/transaction/66454/submission/435435/review";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CONFIRMATION_PATH,
                                                               COMPANY_NUMBER,
                                                               TRANSACTION_ID,
                                                               SUBMISSION_ID);

describe("Confirmation controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show confirmation page for successful payment", async () => {
    const successUrl = URL + "?ref=CS_REFERENCE&state=123456&status=paid";
    const response = await request(app)
      .get(successUrl);

    expect(response.status).toBe(200);
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

  it("Should navigate to error page if error is thrown when getting confirmation page", async () => {
    const spyGetTrans = jest.spyOn(urlUtils, "getTransactionIdFromRequestParams");
    spyGetTrans.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app)
      .get(URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    spyGetTrans.mockRestore();
  });
});
