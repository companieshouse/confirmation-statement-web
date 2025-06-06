import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "limited partnership landing page";

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return limited partnership start page", async () => {
    const response = await request(app)
      .get("/confirmation-statement/limited-partnership");

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain(EXPECTED_TEXT);
  });

});
