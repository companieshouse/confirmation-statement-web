// jest.mock("@companieshouse/web-security-node");
jest.mock("../../src/controllers/confirm.company.controller");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import * as pageUrls from "../../src/types/page.urls";
import { CsrfError } from "@companieshouse/web-security-node";
import * as confirmCompanyController from "../../src/controllers/confirm.company.controller";

const mockGetConfirmCompany = confirmCompanyController.get as jest.Mock;

export const CSRF_TOKEN_ERROR = "CSRF token mismatch";
export const CSRF_ERROR_PAGE_TEXT = "We have not been able to save the information you submitted on the previous screen.";
export const CSRF_ERROR_PAGE_HEADING = "Sorry, something went wrong";

describe("ERROR controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // clearing the mocks will initialise them for first use as well as between tests
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("CSRF error page tests", () => {

    test("Should render the CSRF error page", async () => {
      mockGetConfirmCompany.mockImplementationOnce(() => { throw new CsrfError(CSRF_TOKEN_ERROR); });
      const response = await request(app).get(pageUrls.CONFIRM_COMPANY_PATH);
      expect(response.status).toEqual(403);
      expect(response.text).toContain(CSRF_ERROR_PAGE_HEADING);
      expect(response.text).toContain(CSRF_ERROR_PAGE_TEXT);
    });
  });
});
