
jest.mock("../../src/utils/properties", () => {
  const originalModule = jest.requireActual("../../src/utils/properties");
  return {
    ...originalModule,
    SHOW_SERVICE_OFFLINE_PAGE: "true"
  };
});

jest.mock("../../src/utils/logger");

import request from "supertest";
import app from "../../src/app";
import { CONFIRMATION_STATEMENT } from "../../src/types/page.urls";

describe("Controller test", () => {

  const PAPER_FEE = "£110";

  it("Should render unavailable page", async () => {
    const response = await request(app)
      .get(CONFIRMATION_STATEMENT);

    expect(response.status).toEqual(200);
    expect(response.text).toContain("Sorry, the service is unavailable");
    expect(response.text).toContain(PAPER_FEE);
  });
});
