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

  it("should call next(Error) when company pattern not in url", () => {
    req.originalUrl = CONFIRMATION_STATEMENT;
    companyAuthenticationMiddleware(req, res, next);

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(Error("No Valid Company Number in Request"));
  });
});
