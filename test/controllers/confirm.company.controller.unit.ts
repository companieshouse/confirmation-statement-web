jest.mock("ioredis");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";

  it("Should navigate to confirm company page", async () => {
    const response = await request(app).get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain(PAGE_HEADING);
    expect(mocks.mockServiceAvailabilityMiddleware).toHaveBeenCalled();
  });
});
