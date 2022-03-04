jest.mock("@companieshouse/web-security-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/validators/company.number.validator");

import mockSessionMiddleware from "../mocks/session.middleware.mock";
import mockServiceAvailabilityMiddleware from "../mocks/service.availability.middleware.mock";
import mockAuthenticationMiddleware from "../mocks/authentication.middleware.mock";
import mockIsPscQueryParameterValidationMiddleware from "../mocks/is.psc.validation.middleware.mock";
import mockCompanyNumberQueryParameterValidationMiddleware from "../mocks/company.number.validation.middleware.mock";
import mockTransactionIdValidationMiddleware from "../mocks/transaction.id.validation.middleware.mock";
import mockSubmissionIdValidationMiddleware from "../mocks/submission.id.validation.middleware.mock";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import request from "supertest";
import app from "../../src/app";
import { COMPANY_AUTH_PROTECTED_BASE, CONFIRMATION_STATEMENT } from "../../src/types/page.urls";
import { logger } from "../../src/utils/logger";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";

// get handle on mocked function and create mock function to be returned from calling companyAuthMiddleware
const mockCompanyAuthMiddleware = authMiddleware as jest.Mock;
const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockCompanyNumberValidator = isCompanyNumberValid as jest.Mock;
mockCompanyNumberValidator.mockReturnValue(true);

// when the mocked companyAuthMiddleware is called, make it return a mocked function so we can verify it gets called
const mockAuthReturnedFunction = jest.fn();
mockAuthReturnedFunction.mockImplementation((_req, _res, next) => next());
mockCompanyAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const URL = CONFIRMATION_STATEMENT + COMPANY_AUTH_PROTECTED_BASE.replace(":companyNumber", "12345678");
const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";

const expectedAuthMiddlewareConfig: AuthOptions = {
  chsWebUrl: "http://chs.local",
  returnUrl: URL,
  companyNumber: "12345678"
};

describe("company authentication middleware tests", () => {

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
  });

  it("should call CH authentication library when company pattern in url", async () => {
    await request(app).get(URL);

    expect(mockCompanyAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
    expect(mockAuthReturnedFunction).toHaveBeenCalled();
  });

  it("should call CH authentication library when company pattern in middle of url", async () => {
    const extraUrl = URL + "/extra";
    const originalReturnUrl = expectedAuthMiddlewareConfig.returnUrl;
    expectedAuthMiddlewareConfig.returnUrl = extraUrl;

    await request(app).get(extraUrl);

    expect(mockCompanyAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
    expect(mockAuthReturnedFunction).toHaveBeenCalled();

    expectedAuthMiddlewareConfig.returnUrl = originalReturnUrl;
  });

  it("should call next(Error) when invalid company pattern in url", async () => {
    mockCompanyNumberValidator.mockReturnValueOnce(false);

    const returnedPage = await request(app).get(CONFIRMATION_STATEMENT + "/company/1234");

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toEqual(`No Valid Company Number in URL: ${CONFIRMATION_STATEMENT}/company/1234`);
    expect(returnedPage.text).toContain(ERROR_PAGE_TEXT);
  });

  it("should call next(Error) when company pattern not in url", async () => {
    mockCompanyNumberValidator.mockReturnValueOnce(false);

    const returnedPage = await request(app).get(CONFIRMATION_STATEMENT + "/company/test");

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toEqual(`No Valid Company Number in URL: ${CONFIRMATION_STATEMENT}/company/test`);
    expect(returnedPage.text).toContain(ERROR_PAGE_TEXT);
  });
});
