jest.mock("@companieshouse/web-security-node");
jest.mock("../../src/controllers/confirm.company.controller");
jest.mock("../../src/validators/company.number.validator")

import mocks from "../mocks/all.middleware.mock";
import * as confirmCompanyController from "../../src/controllers/confirm.company.controller";
import request from "supertest";
import app from "../../src/app";
import * as pageUrls from "../../src/types/page.urls";
import { CsrfError } from "@companieshouse/web-security-node";
import { authMiddleware } from "@companieshouse/web-security-node";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

// get handle on mocked function and create mock function to be returned from calling companyAuthMiddleware
const mockCompanyAuthMiddleware = authMiddleware as jest.Mock;
const mockCompanyNumberValidator = isCompanyNumberValid as jest.Mock;
mockCompanyNumberValidator.mockReturnValue(true);

// when the mocked companyAuthMiddleware is called, make it return a mocked function so we can verify it gets called
const mockAuthReturnedFunction = jest.fn();
mockAuthReturnedFunction.mockImplementation((_req, _res, next) => next());
mockCompanyAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const mockGetConfirmCompany = confirmCompanyController.get as jest.Mock;

export const CSRF_TOKEN_ERROR = "CSRF token mismatch";
export const CSRF_ERROR_PAGE_TEXT = "We have not been able to save the information you submitted on the previous screen.";
export const CSRF_ERROR_PAGE_HEADING = "Sorry, something went wrong";

describe("ERROR controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CSRF error page tests", () => {

    test("Should render the CSRF error page", async () => {
      mockGetConfirmCompany.mockImplementationOnce(() => { throw new CsrfError(CSRF_TOKEN_ERROR); });
      const response = await request(app).get(pageUrls.CONFIRM_COMPANY_PATH);
      expect(response.status).toEqual(403);
      expect(response.text).toContain(CSRF_ERROR_PAGE_HEADING);
      expect(response.text).toContain(CSRF_ERROR_PAGE_TEXT);
      // expect(response.text).toContain(pageUrls.SERVICE_NAME);
    });    
  });
});