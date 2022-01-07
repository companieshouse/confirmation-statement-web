jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.officers.details.service");
jest.mock("../../../src/utils/format");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { CORPORATE_DIRECTORS_PATH, CORPORATE_SECRETARIES_PATH, NATURAL_PERSON_DIRECTORS_PATH, NATURAL_PERSON_SECRETARIES_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { SECRETARY_DETAILS_ERROR, WRONG_DETAILS_UPDATE_SECRETARY } from "../../../src/utils/constants";
import { formatSecretaryList } from "../../../src/utils/format";
import { getActiveOfficersDetailsData, getOfficerTypeList } from "../../../src/services/active.officers.details.service";
import { mockActiveOfficersDetails } from "../../mocks/active.officers.details.mock";

const FORMATTED_SERVICE_ADDRESS = "Formatted Service Address";
const FORENAME = "DUMMYFORENAME";
const SURNAME = "DUMMYSURNAME";
const DATE_OF_APPOINTMENT = "03 August 2003";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockformatSecretaryList = formatSecretaryList as jest.Mock;
mockformatSecretaryList.mockReturnValue([{
  forename: FORENAME,
  surname: SURNAME,
  dateOfAppointment: DATE_OF_APPOINTMENT,
  serviceAddress: FORMATTED_SERVICE_ADDRESS
}]);
const mockGetActiveOfficerDetails = getActiveOfficersDetailsData as jest.Mock;
mockGetActiveOfficerDetails.mockResolvedValue(mockActiveOfficersDetails);
const mockGetOfficerTypeList = getOfficerTypeList as jest.Mock;

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Check the secretaries' details";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const NATURAL_PERSON_SECRETARIES_URL = NATURAL_PERSON_SECRETARIES_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const CORPORATE_SECRETARIES_URL = CORPORATE_SECRETARIES_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const NATURAL_PERSON_DIRECTORS_URL = NATURAL_PERSON_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const CORPORATE_DIRECTORS_URL = CORPORATE_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);


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

    it("Should go to next relevant page when secretary details radio button is yes", async () => {
      mockGetOfficerTypeList.mockReturnValue([
        "corporateSecretary",
        "naturalDirector",
        "corporateDirector"
      ]);
      const response = await request(app).post(NATURAL_PERSON_SECRETARIES_URL)
        .send({ naturalPersonSecretaries: "yes" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(CORPORATE_SECRETARIES_URL);
    });

    it("Should go to next relevant page when secretary details radio button is yes", async () => {
      mockGetOfficerTypeList.mockReturnValue([
        "naturalDirector",
        "corporateDirector"
      ]);
      const response = await request(app).post(NATURAL_PERSON_SECRETARIES_URL)
        .send({ naturalPersonSecretaries: "yes" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(NATURAL_PERSON_DIRECTORS_URL);
    });

    it("Should go to next relevant page when secretary details radio button is yes", async () => {
      mockGetOfficerTypeList.mockReturnValue([
        "corporateDirector"
      ]);
      const response = await request(app).post(NATURAL_PERSON_SECRETARIES_URL)
        .send({ naturalPersonSecretaries: "yes" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(CORPORATE_DIRECTORS_URL);
    });

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
