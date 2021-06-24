import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "Check the SIC codes";

describe("Confirm sic code controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return sic code page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const response = await request(app)
      .get("/confirmation-statement/sic");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });
});
