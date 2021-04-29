jest.mock("ioredis");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/service.availability.middleware");
jest.mock("../../src/middleware/session.middleware");

import request from "supertest";
import app from "../../src/app";

import { NextFunction } from "express";
import { authenticationMiddleware } from "../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";

const dummyMiddleware = (req: Request, res: Response, next: NextFunction) => next();

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
const mockSessionMiddleware = sessionMiddleware as jest.Mock;

mockServiceAvailabilityMiddleware.mockImplementation(dummyMiddleware);
mockAuthenticationMiddleware.mockImplementation(dummyMiddleware);
mockSessionMiddleware.mockImplementation(dummyMiddleware);

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";

  it("Should navigate to confirm company page", async () => {
    const response = await request(app).get(CONFIRM_COMPANY_PATH);
    expect(response.text).toContain(PAGE_HEADING);
  });
});
