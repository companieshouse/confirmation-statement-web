import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { urlUtils } from "../../../src/utils/url";
import { PSC_STATEMENT_PATH } from "../../../src/types/page.urls";
import { PSC_STATEMENT_CONTROL_ERROR, RADIO_BUTTON_VALUE } from "../../../src/utils/constants";

const PAGE_TITLE = "Review the people with significant control";
const PAGE_HEADING = "Is the PSC statement correct?";
const STOP_PAGE_HEADING = "";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66544";
const SUBMISSION_ID = "6464647";
const PSC_STATEMENT_URL =
        urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PSC_STATEMENT_PATH,
                                                                     COMPANY_NUMBER,
                                                                     TRANSACTION_ID,
                                                                     SUBMISSION_ID);

describe("PSC Statement controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  describe("get tests", () => {
    it("Should show the psc statement page", async () => {
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should return an error page if error is thrown", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain("Sorry, the service is unavailable");

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });
  });

  describe("post tests", function () {
    it("Should redisplay psc page with error when radio button is not selected", async () => {
      const response = await request(app).post(PSC_STATEMENT_URL);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_TITLE);
      expect(response.text).toContain(PSC_STATEMENT_CONTROL_ERROR);
      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display wrong psc data page when no radio button is selected", async () => {
      const response = await request(app)
        .post(PSC_STATEMENT_URL)
        .send({ pscRadioValue: RADIO_BUTTON_VALUE.NO });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
    });


    it("Should return an error page if error is thrown", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(PSC_STATEMENT_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain("Sorry, the service is unavailable");

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });
  });
});
