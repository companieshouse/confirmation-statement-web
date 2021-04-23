jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/session.middleware");
jest.mock("../../src/utils/feature.flag");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";

// create a dummy middleware function to use in the mocks
const dummyMiddleware = (req: Request, res: Response, next: NextFunction) => next();

// get handles on mocked functions
const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
const mockSessionMiddleware = sessionMiddleware as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;

// tell the mocks what to return
mockAuthenticationMiddleware.mockImplementation(dummyMiddleware);
mockSessionMiddleware.mockImplementation(dummyMiddleware);

describe("service availability middleware tests", () => {

  it("should return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const response = await request(app).get("/confirmation-statement");

    expect(response.text).toContain("Service offline - File a confirmation statement");
  });

  it("should not return service offline page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const response = await request(app).get("/confirmation-statement");

    expect(response.text).not.toContain("Service offline - File a confirmation statement");
  });

});
