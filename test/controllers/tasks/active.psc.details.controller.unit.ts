import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_PSC_DETAILS_PATH, urlParams } from "../../../src/types/page.urls";

const COMPANY_NUMBER = "12345678";
const ACTIVE_PSC_DETAILS_URL = ACTIVE_PSC_DETAILS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const PAGE_HEADING = "Review the people with significant control";

describe("Active psc details controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to active psc details page", async () => {
      const response = await request(app).get(ACTIVE_PSC_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });
  });
});
