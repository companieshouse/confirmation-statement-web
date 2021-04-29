jest.mock("ioredis")
jest.mock("../../src/middleware/session.middleware");

import { NextFunction, Request, Response } from "express";
import { sessionMiddleware } from "../../src/middleware/session.middleware";

// get handle on mocked function
const mockSessionMiddleware = sessionMiddleware as jest.Mock;

// tell the mock what to return
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockSessionMiddleware;
