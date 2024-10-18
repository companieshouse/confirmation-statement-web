jest.mock("ioredis");
jest.mock("../../src/utils/feature.flag");

import mockCsrfProtectionMiddleware from "../mocks/csrf.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("service availability middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockCsrfProtectionMiddleware.mockClear();
  });

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

  it("should not return service offline page for accessibility statement page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const response = await request(app).get("/confirmation-statement/accessibility-statement");

    expect(response.text).not.toContain("Service offline - File a confirmation statement");
  });
});
