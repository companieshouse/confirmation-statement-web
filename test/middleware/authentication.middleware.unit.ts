jest.mock("@companieshouse/web-security-node");

import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { NextFunction, Request, Response } from "express";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";

// get handle on mocked function and create mock function to be returned from calling authMiddleware
const mockAuthMiddleware = authMiddleware as jest.Mock;
const mockAuthReturnedFunction = jest.fn();

// when the mocked authMiddleware is called, make it return a mocked function so we can verify it gets called
mockAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const URL = "/confirmation-statement/something";
const req: Request = { originalUrl: URL } as Request;
const res: Response = {} as Response;
const next: NextFunction = () => { return; };

const expectedAuthMiddlewareConfig: AuthOptions = {
  accountWebUrl: "",
  returnUrl: URL
};

describe("authentication middleware tests", () => {

  it("should call CH authentication library", () => {
    authenticationMiddleware(req, res, next);

    expect(mockAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
    expect(mockAuthReturnedFunction).toHaveBeenCalledWith(req, res, next);
  });
});
