import mocks from "../mocks/all.middleware.mock";
import { TRADING_STOP_PATH } from "../../src/types/page.urls";
import request from "supertest";
import app from "../../src/app";

const TRADING_STOP_PAGE_TITLE = "You must use our WebFiling service to update the trading status - File a confirmation statement - GOV.UK";

describe("Trading stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the trading stop page", async () => {
      const response = await request(app).get(TRADING_STOP_PATH);

      expect(response.text).toContain(TRADING_STOP_PAGE_TITLE);
      expect(response.text).toContain("You must update this information by filing a confirmation statement through");
    });
  });
});
