jest.mock("../../../src/services/psc.service");
jest.mock("../../../src/utils/api.enumerations");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { urlUtils } from "../../../src/utils/url";
import { PSC_STATEMENT_PATH, URL_QUERY_PARAM } from "../../../src/types/page.urls";
import {
  PSC_STATEMENT_CONTROL_ERROR,
  RADIO_BUTTON_VALUE,
  PSC_STATEMENT_NOT_FOUND,
  PSC_STATEMENT_NAME_PLACEHOLDER } from "../../../src/utils/constants";
import { getMostRecentActivePscStatement } from "../../../src/services/psc.service";
import { mockSingleActivePsc } from "../../mocks/person.of.significant.control.mock";
import { lookupPscStatementDescription } from "../../../src/utils/api.enumerations";
import { Templates } from "../../../src/types/template.paths";

const PAGE_TITLE = "Review the people with significant control";
const PAGE_HEADING = "Is the PSC statement correct?";
const STOP_PAGE_HEADING = "Update the people with significant control (PSC) details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66544";
const SUBMISSION_ID = "6464647";
const PSC_STATEMENT_TEXT = "this is a psc statement";
const PSC_STATEMENT_URL =
        urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PSC_STATEMENT_PATH,
                                                                     COMPANY_NUMBER,
                                                                     TRANSACTION_ID,
                                                                     SUBMISSION_ID);

const mockGetMostRecentActivePscStatement = getMostRecentActivePscStatement as jest.Mock;
mockGetMostRecentActivePscStatement.mockResolvedValue(mockSingleActivePsc);

const mockLookupPscStatementDescription = lookupPscStatementDescription as jest.Mock;
mockLookupPscStatementDescription.mockReturnValue(PSC_STATEMENT_TEXT);

describe("PSC Statement controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockGetMostRecentActivePscStatement.mockClear();
    mockLookupPscStatementDescription.mockClear();
  });

  describe("get tests", () => {
    it("Should show the psc statement page", async () => {
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should back-link to the psc details page", async () => {
      const response = await request(app)
        .get(pscStatementPathWithIsPscParam("true"));

      expect(response.text).toContain(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL);
    });

    it("Should back-link to the psc details page when no query param is provided", async () => {
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.text).toContain(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL);
    });

    it("Should back-link to the task list page", async () => {
      const response = await request(app)
        .get(pscStatementPathWithIsPscParam("false"));

      expect(response.text).toContain(Templates.TASK_LIST);
    });

    it("Should show the psc statement text", async () => {
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.text).toContain(PSC_STATEMENT_TEXT);
      expect(mockLookupPscStatementDescription).toBeCalledWith(mockSingleActivePsc.statement);
    });

    it("Should show the not found psc statement text", async () => {
      mockGetMostRecentActivePscStatement.mockResolvedValueOnce(undefined);
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.text).toContain(PSC_STATEMENT_NOT_FOUND);
      expect(mockLookupPscStatementDescription).not.toHaveBeenCalled();
    });

    it("Should replace the name placeholder in psc statement text", async () => {
      mockLookupPscStatementDescription.mockReturnValueOnce(`test ${PSC_STATEMENT_NAME_PLACEHOLDER} test`);
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.text).toContain(`test ${mockSingleActivePsc.linkedPscName} test`);
    });

    it("Should not replace the name placeholder in psc statement text if name not supplied", async () => {
      mockLookupPscStatementDescription.mockReturnValueOnce(`test ${PSC_STATEMENT_NAME_PLACEHOLDER} test`);
      mockGetMostRecentActivePscStatement.mockResolvedValueOnce({
        etag: "etag",
        kind: "kind",
        links: {
          self: "self"
        },
        notifiedOn: "2020-05-03",
        statement: "api-enumeration-key",
        linkedPscName: undefined
      });
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.text).toContain(`test ${PSC_STATEMENT_NAME_PLACEHOLDER} test`);
    });

    it("Should return error page if unable to lookup statement description", async () => {
      mockLookupPscStatementDescription.mockReturnValueOnce(undefined);
      const response = await request(app)
        .get(PSC_STATEMENT_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain("Sorry, the service is unavailable");
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
        .send({ pscStatementValue: RADIO_BUTTON_VALUE.NO });

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

const pscStatementPathWithIsPscParam = (isPscValue: string) => {
  return urlUtils.setQueryParam(PSC_STATEMENT_URL, URL_QUERY_PARAM.IS_PSC, isPscValue);
};
