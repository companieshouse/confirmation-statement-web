jest.mock("../../../src/services/psc.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { urlUtils } from "../../../src/utils/url";
import { PSC_STATEMENT_PATH } from "../../../src/types/page.urls";
import { PSC_STATEMENT_CONTROL_ERROR, PSC_STATEMENT_NOT_FOUND } from "../../../src/utils/constants";
import { getMostRecentActivePscStatement } from "../../../src/services/psc.service";
import { mockSingleActivePsc } from "../../mocks/person.of.significant.control.mock";

const PAGE_TITLE = "Review the people with significant control";
const PAGE_HEADING = "Is the PSC statement correct?";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66544";
const SUBMISSION_ID = "6464647";
const PSC_STATEMENT_URL =
        urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PSC_STATEMENT_PATH,
                                                                     COMPANY_NUMBER,
                                                                     TRANSACTION_ID,
                                                                     SUBMISSION_ID);

const mockGetMostRecentActivePscStatement = getMostRecentActivePscStatement as jest.Mock;
mockGetMostRecentActivePscStatement.mockResolvedValue(mockSingleActivePsc);

describe("PSC Statement controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockGetMostRecentActivePscStatement.mockClear();
  });

  describe("get tests", () => {
    it("Should show the psc statement page", async () => {
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(mockSingleActivePsc.statement);
    });

    it("Should show the psc statement text", async () => {
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.text).toContain(mockSingleActivePsc.statement);
    });

    it("Should show the not found psc statement text", async () => {
      mockGetMostRecentActivePscStatement.mockResolvedValueOnce(undefined);
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.text).toContain(PSC_STATEMENT_NOT_FOUND);
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
