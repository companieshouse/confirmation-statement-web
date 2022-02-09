import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { WRONG_SIC_PATH } from "../../../src/types/page.urls";

const STOP_PAGE_TEXT = "Currently, changes to the company SIC codes can only be made by filing a confirmation statement";
const SIC_CODE = "123";
const SIC_CODE_DESCRIPTIONS = "Test SIC code descriptions";
const SIC_CODE_DETAILS = "<strong>" + SIC_CODE + "</strong> - " + SIC_CODE_DESCRIPTIONS;

describe("Wrong sic stop controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("test for the get function", () => {

    it("Should render the wrong sic stop page", async () => {
      const response = await request(app).get(WRONG_SIC_PATH);

      expect(response.text).toContain(STOP_PAGE_TEXT);
      expect(response.text).not.toContain(SIC_CODE_DETAILS);
      expect(response.text).toContain("Incorrect SIC");
    });
  });
});
