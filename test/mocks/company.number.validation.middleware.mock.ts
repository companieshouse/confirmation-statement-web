jest.mock("../../src/middleware/company.number.validation.middleware");

import { NextFunction, Request, Response } from "express";
import { companyNumberQueryParameterValidationMiddleware } from "../../src/middleware/company.number.validation.middleware";

// get handle on mocked function
const mockCompanyNumberQueryParameterValidationMiddleware = companyNumberQueryParameterValidationMiddleware as jest.Mock;

// tell the mock what to return
mockCompanyNumberQueryParameterValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockCompanyNumberQueryParameterValidationMiddleware;
