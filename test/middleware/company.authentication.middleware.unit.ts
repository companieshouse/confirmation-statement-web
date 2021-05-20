jest.mock("@companieshouse/web-security-node");

import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { Request, Response } from "express";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { COMPANY_AUTH_PROTECTED_BASE, CONFIRMATION_STATEMENT } from "../../src/types/page.urls";

// get handle on mocked function and create mock function to be returned from calling companyAuthMiddleware
const mockCompanyAuthMiddleware = authMiddleware as jest.Mock;
const mockAuthReturnedFunction = jest.fn();

// when the mocked companyAuthMiddleware is called, make it return a mocked function so we can verify it gets called
mockCompanyAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const URL = COMPANY_AUTH_PROTECTED_BASE.replace(":companyNumber", "12345678");
const req: Request = { originalUrl: URL } as Request;
const res: Response = {} as Response;
const next = jest.fn();

const expectedAuthMiddlewareConfig: AuthOptions = {
  chsWebUrl: "http://chs.local",
  returnUrl: URL,
  companyNumber: "12345678"
};

describe("company authentication middleware tests", () => {

  beforeEach(() => {
    mockCompanyAuthMiddleware.mockClear();
    next.mockClear();
    req.originalUrl = URL;
  });

  it("should call CH authentication library when company pattern in url", () => {
    companyAuthenticationMiddleware(req, res, next);

    expect(mockCompanyAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
    expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
  });

  it("should call CH authentication library when company pattern in middle of url", () => {
    req.originalUrl = req.originalUrl + "/some-extra-stuff";
    expectedAuthMiddlewareConfig.returnUrl = req.originalUrl;
    companyAuthenticationMiddleware(req, res, next);

    expect(mockCompanyAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
    expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
  });

  it("should call CH authentication library when two letter 6 number pattern in url", () => {
    req.originalUrl = COMPANY_AUTH_PROTECTED_BASE.replace(":companyNumber", "AB123456");
    expectedAuthMiddlewareConfig.companyNumber = "AB123456";
    expectedAuthMiddlewareConfig.returnUrl = COMPANY_AUTH_PROTECTED_BASE.replace(":companyNumber", "AB123456");
    companyAuthenticationMiddleware(req, res, next);

    expect(mockCompanyAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
    expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
  });

  it("should call next(Error) when invalid company pattern in url", () => {
    req.originalUrl = COMPANY_AUTH_PROTECTED_BASE.replace(":companyNumber", "1234567890");
    companyAuthenticationMiddleware(req, res, next);

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(Error("No Valid Company Number in Request"));
  });

  it("should call next(Error) when company pattern not in url", () => {
    req.originalUrl = CONFIRMATION_STATEMENT;
    companyAuthenticationMiddleware(req, res, next);

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(Error("No Valid Company Number in Request"));
  });
});
