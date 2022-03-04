jest.mock("../../src/middleware/transaction.id.validation.middleware");

import { NextFunction, Request, Response } from "express";
import { transactionIdValidationMiddleware } from "../../src/middleware/transaction.id.validation.middleware";

// get handle on mocked function
const mockTransactionIdValidationMiddleware = transactionIdValidationMiddleware as jest.Mock;

// tell the mock what to return
mockTransactionIdValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockTransactionIdValidationMiddleware;
