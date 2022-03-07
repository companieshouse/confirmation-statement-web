jest.mock("../../src/middleware/is.psc.validation.middleware");

import { NextFunction, Request, Response } from "express";
import { isPscQueryParameterValidationMiddleware } from "../../src/middleware/is.psc.validation.middleware";

// get handle on mocked function
const mockIsPscQueryParameterValidationMiddleware = isPscQueryParameterValidationMiddleware as jest.Mock;

// tell the mock what to return
mockIsPscQueryParameterValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockIsPscQueryParameterValidationMiddleware;
