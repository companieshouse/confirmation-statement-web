jest.mock("../../src/validators/is.psc.validator");

import { Request, Response } from "express";
import { isPscQueryParameterValidationMiddleware } from "../../src/middleware/is.psc.validation.middleware";
import { Templates } from "../../src/types/template.paths";
import { isPscFlagValid } from "../../src/validators/is.psc.validator";
import { urlUtils } from "../../src/utils/url";

const req: Request = {} as Request;
const res: Response = {} as Response;
const mockStatus = jest.fn() as jest.Mock;
const mockRender = jest.fn() as jest.Mock;
mockRender.mockImplementation((..._args: any) => { return; });
mockStatus.mockImplementation((_view: string, _options?: object) => { return { render: mockRender }; });
res.status = mockStatus;
const next = jest.fn();
const mockIsPscValidator = isPscFlagValid as jest.Mock;
mockIsPscValidator.mockReturnValue(true);

urlUtils.sanitiseReqlUrls = jest.fn();

describe("is PSC validation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() when isPsc query parameter not present", () => {
    req.query = { isPsc: undefined };

    isPscQueryParameterValidationMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should call next() when no query parameters are not present", () => {
    req.query = {};

    isPscQueryParameterValidationMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should call next() when isPsc query parameter validation passes", () => {
    req.query = { isPsc: "true" };

    isPscQueryParameterValidationMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should show the error screen when isPsc query parameter validation fails", () => {
    mockIsPscValidator.mockReturnValueOnce(false);

    req.query = { isPsc: "invalidValue" };

    isPscQueryParameterValidationMiddleware(req, res, next);

    expect(mockStatus.mock.calls[0][0]).toEqual(400);
    expect(mockRender.mock.calls[0][0]).toEqual(Templates.SERVICE_OFFLINE_MID_JOURNEY);
  });
});
