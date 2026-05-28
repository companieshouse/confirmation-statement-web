import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "File a confirmation statement";
const EXPECTED_FEE = "£50";

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return start page", async () => {
    const response = await request(app)
      .get("/confirmation-statement");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("should return start page when url has trailing slash", async () => {
    const response = await request(app)
      .get("/confirmation-statement/");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.text).toContain(EXPECTED_FEE);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("should redirect to company-number when type contains limited-partnership", async () => {
    const response = await request(app)
      .get("/confirmation-statement?type=limited-partnership");

    expect(response.status).toBe(302);
    expect(response.header.location).toEqual("/confirmation-statement/company-number");
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("should return start page when type does not contain limited-partnership", async () => {
    const response = await request(app)
      .get("/confirmation-statement?type=ltd");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("should redirect when type contains limited-partnership case-insensitive or comma-separated", async () => {
    const response = await request(app)
      .get("/confirmation-statement?type=Limited-Partnership,other");

    expect(response.status).toBe(302);
    expect(response.header.location).toEqual("/confirmation-statement/company-number");
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
  });

});
