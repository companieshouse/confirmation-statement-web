import { Templates } from "../../src/types/template.paths";

jest.mock("@companieshouse/web-security-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/validators/company.number.validator");

import { Request, Response } from "express";
import { companyNumberQueryParameterValidationMiddleware } from "../../src/middleware/company.number.validation.middleware";
import { isCompanyNumberValid } from "../../src/validators/company.number.validator";
import { urlUtils } from "../../src/utils/url";

const req: Request = {} as Request;
const res: Response = {} as Response;
const mockStatus = jest.fn() as jest.Mock;
const mockRender = jest.fn() as jest.Mock;
mockRender.mockImplementation((..._args: any) => { return; });
mockStatus.mockImplementation((_view: string, _options?: object) => { return { render: mockRender }; });
res.status = mockStatus;
const next = jest.fn();
const mockCompanyNumberValidator = isCompanyNumberValid as jest.Mock;

describe("company number validation middleware tests", () => {

  beforeEach(() => {
    urlUtils.sanitiseReqlUrls = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next() when company number query parameter is not defined", () => {
    req.query = { companyNumber: undefined };

    companyNumberQueryParameterValidationMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(urlUtils.sanitiseReqlUrls).not.toHaveBeenCalled();
  });

  it("should call next() when company number query parameter not present", () => {
    req.query = {};

    companyNumberQueryParameterValidationMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(urlUtils.sanitiseReqlUrls).not.toHaveBeenCalled();
  });

  it("should call next() when company number query parameter validation passes", () => {
    req.query = { companyNumber: "12345678" };
    mockCompanyNumberValidator.mockReturnValueOnce(true);

    companyNumberQueryParameterValidationMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(urlUtils.sanitiseReqlUrls).not.toHaveBeenCalled();
  });

  it("should show the error screen when isPsc query parameter validation fails", () => {
    req.query = { companyNumber: "InvalidValue" };
    mockCompanyNumberValidator.mockReturnValueOnce(false);

    companyNumberQueryParameterValidationMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockStatus.mock.calls[0][0]).toEqual(400);
    expect(mockRender.mock.calls[0][0]).toEqual(Templates.SERVICE_OFFLINE_MID_JOURNEY);
    expect(urlUtils.sanitiseReqlUrls).toHaveBeenCalled();
  });
});
