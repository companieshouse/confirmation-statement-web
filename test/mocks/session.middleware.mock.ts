jest.mock("ioredis");
jest.mock("../../src/middleware/session.middleware");

import { NextFunction, Request, Response } from "express";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { Session } from "@companieshouse/node-session-handler";
import { PAYMENT_NONCE_SESSION_KEY } from "../../src/utils/constants";

// get handle on mocked function
const mockSessionMiddleware = sessionMiddleware as jest.Mock;

export const session = new Session();

// tell the mock what to return
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  req.session = session;
  req.session.data.extra_data[PAYMENT_NONCE_SESSION_KEY] = "123456";
  req.session.data.extra_data["entered-email-address"] = "info@mock-test.com";
  next();
});

export default mockSessionMiddleware;
