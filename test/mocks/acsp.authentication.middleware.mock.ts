jest.mock("../../src/middleware/acsp.authentication.middleware");

import { NextFunction, Request, Response } from "express";
import { acspAuthenticationMiddleware } from "../../src/middleware/acsp.authentication.middleware";

// get handle on mocked function
const mockAcspAuthenticationMiddleware = acspAuthenticationMiddleware as jest.Mock;

// tell the mock what to return
mockAcspAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockAcspAuthenticationMiddleware;
