jest.mock("../../src/middleware/submission.id.validation.middleware");

import { NextFunction, Request, Response } from "express";
import { submissionIdValidationMiddleware } from "../../src/middleware/submission.id.validation.middleware";

// get handle on mocked function
const mockSubmissionIdValidationMiddleware = submissionIdValidationMiddleware as jest.Mock;

// tell the mock what to return
mockSubmissionIdValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockSubmissionIdValidationMiddleware;
