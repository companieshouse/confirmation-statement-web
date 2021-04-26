jest.mock("ioredis");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "This is the company number page";

describe("company number controller tests", () => {
  it("should return company number page", async () => {
    const response = await request(app)
      .get("/confirmation-statement/company-number");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });
});
