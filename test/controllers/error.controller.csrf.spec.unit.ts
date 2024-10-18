jest.mock("@companieshouse/web-security-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/controllers/confirm.company.controller");
jest.mock("../../src/validators/company.number.validator");

import mockCsrfProtectionMiddleware from "../mocks/csrf.middleware.mock";
import mockSessionMiddleware from "../mocks/session.middleware.mock";
import mockServiceAvailabilityMiddleware from "../mocks/service.availability.middleware.mock";
import mockAuthenticationMiddleware from "../mocks/authentication.middleware.mock";
import mockIsPscQueryParameterValidationMiddleware from "../mocks/is.psc.validation.middleware.mock";
import mockCompanyNumberQueryParameterValidationMiddleware from "../mocks/company.number.validation.middleware.mock";
import mockTransactionIdValidationMiddleware from "../mocks/transaction.id.validation.middleware.mock";
import mockSubmissionIdValidationMiddleware from "../mocks/submission.id.validation.middleware.mock";
import * as confirmCompanyController from "../../src/controllers/confirm.company.controller";
import request from "supertest";
import app from "../../src/app";
import * as pageUrls from "../../src/types/page.urls";
import { CsrfError, authMiddleware } from "@companieshouse/web-security-node";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";
import { logger } from "../../src/utils/logger";

// get handle on mocked function and create mock function to be returned from calling companyAuthMiddleware
const mockCompanyAuthMiddleware = authMiddleware as jest.Mock;
const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockCompanyNumberValidator = isCompanyNumberValid as jest.Mock;
mockCompanyNumberValidator.mockReturnValue(true);

// when the mocked companyAuthMiddleware is called, make it return a mocked function so we can verify it gets called
const mockAuthReturnedFunction = jest.fn();
mockAuthReturnedFunction.mockImplementation((_req, _res, next) => next());
mockCompanyAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const mockGetConfirmCompany = confirmCompanyController.get as jest.Mock;

const CSRF_TOKEN_ERROR = "CSRF token mismatch";
const CSRF_ERROR_PAGE_TEXT = "We have not been able to save the information you submitted on the previous screen.";
const CSRF_ERROR_PAGE_HEADING = "Sorry, something went wrong";

describe("ERROR controller", () => {

  beforeEach(() => {
    mockCompanyAuthMiddleware.mockClear();
    mockSessionMiddleware.mockClear();
    mockServiceAvailabilityMiddleware.mockClear();
    mockAuthenticationMiddleware.mockClear();
    mockIsPscQueryParameterValidationMiddleware.mockClear();
    mockCompanyNumberQueryParameterValidationMiddleware.mockClear();
    mockTransactionIdValidationMiddleware.mockClear();
    mockSubmissionIdValidationMiddleware.mockClear();
    mockLoggerErrorRequest.mockClear();
    mockCsrfProtectionMiddleware.mockClear();
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