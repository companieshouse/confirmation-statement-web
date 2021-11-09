jest.mock("../../../src/middleware/company.authentication.middleware");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { NATURAL_PERSON_SECRETARIES_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { SECRETARY_DETAILS_ERROR, WRONG_DETAILS_UPDATE_SECRETARY } from "../../../src/utils/constants";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Check the secretaries' details";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const NATURAL_PERSON_SECRETARIES_URL = NATURAL_PERSON_SECRETARIES_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Natural person secretaries controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to secretaries details page", async () => {
      const response = await request(app).get(NATURAL_PERSON_SECRETARIES_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Are the secretary details correct?");
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(NATURAL_PERSON_SECRETARIES_URL);
      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
      spyGetUrl.mockRestore();
    });

  });

  describe("post tests", () => {

    it("Should go to stop page when secretary details radio button is no", async () => {
      const response = await request(app).post(NATURAL_PERSON_SECRETARIES_URL)
        .send({ naturalPersonSecretaries: "no" });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_DETAILS_UPDATE_SECRETARY);
    });

    it("Should redisplay natural person secretary details page with error when radio button is not selected", async () => {
      const response = await request(app).post(NATURAL_PERSON_SECRETARIES_URL);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(SECRETARY_DETAILS_ERROR);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(NATURAL_PERSON_SECRETARIES_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
      // restore original function so it is no longer mocked
      spyGetUrl.mockRestore();
    });

  });

});
