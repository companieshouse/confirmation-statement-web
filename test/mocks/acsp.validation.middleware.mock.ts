jest.mock("../../src/middleware/acsp.validation.middleware");

import { NextFunction, Request, Response } from "express";
import { acspValidationMiddleware } from "../../src/middleware/acsp.validation.middleware";

// get handle on mocked function
const mockAcspValidationMiddleware = acspValidationMiddleware as jest.Mock;

// tell the mock what to return
mockAcspValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockAcspValidationMiddleware;

