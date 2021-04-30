import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_LOCATION = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber=%7BcompanyNumber%7D";

describe("company number controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("should return company number page", async () => {
    const response = await request(app)
      .get("/confirmation-statement/company-number");

    expect(response.status).toBe(302);
    expect(response.header.location).toBe(EXPECTED_LOCATION );
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });
});
