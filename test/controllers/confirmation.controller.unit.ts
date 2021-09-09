jest.mock("../../src/services/confirmation.statement.service");

import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import { urlUtils } from "../../src/utils/url";
import { CONFIRM_COMPANY_PATH, CONFIRMATION_PATH } from "../../src/types/page.urls";


const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Confirmation";
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

  it("should show confirmation page", async () => {
    const response = await request(app)
      .get(URL);

    expect(response.status).toBe(200);
    expect(response.text).toContain(PAGE_HEADING);
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
