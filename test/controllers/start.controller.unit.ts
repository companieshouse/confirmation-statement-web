jest.mock("ioredis");
jest.mock("../../src/middleware/service.availability.middleware");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";

// create a dummy middleware function to use in the mocks
const dummyMiddleware = (req: Request, res: Response, next: NextFunction) => next();

// get handles on mocked functions
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
const mockSessionMiddleware = sessionMiddleware as jest.Mock;

// tell the mocks what to return
mockServiceAvailabilityMiddleware.mockImplementation(dummyMiddleware);
mockAuthenticationMiddleware.mockImplementation(dummyMiddleware);
mockSessionMiddleware.mockImplementation(dummyMiddleware);


const EXPECTED_TEXT = "File a confirmation statement";

describe("start controller tests", () => {
  it("should return start page", async () => {
    const response = await request(app)
      .get("/confirmation-statement");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(mockAuthenticationMiddleware).toHaveBeenCalled;
  });

});
