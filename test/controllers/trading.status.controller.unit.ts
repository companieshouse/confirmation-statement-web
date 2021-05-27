import request from "supertest";
import app from "../../src/app";
import { TRADING_STATUS } from "../../src/types/page.urls";
import mocks from "../mocks/all.middleware.mock";

describe("Trading status cotroller tests", () => {
  const PAGE_HEADING = "Check the trading status of shares";

  it("Should navigate to the trading status page", async () => {
    const response = await request(app)
      .get(TRADING_STATUS);
    expect(response.text).toContain(PAGE_HEADING);
    expect(mocks.mockServiceAvailabilityMiddleware).toHaveBeenCalled();
  });
});
