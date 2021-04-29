import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "Page not found - File a confirmation statement";
const INCORRECT_URL = "/confirmation-statement/company-numberr";

describe("error controller test", () => {
  it("should return page not found screen if page url is not recognised", async () => {
    const response = await request(app)
      .get(INCORRECT_URL);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.status).toEqual(404);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });
});
