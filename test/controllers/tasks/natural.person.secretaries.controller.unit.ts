jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.officers.details.service");
jest.mock("../../../src/utils/format");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { NATURAL_PERSON_SECRETARIES_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { SECRETARY_DETAILS_ERROR, WRONG_DETAILS_UPDATE_SECRETARY } from "../../../src/utils/constants";
import { formatSecretaryList } from "../../../src/utils/format";
import { getActiveOfficersDetailsData } from "../../../src/services/active.officers.details.service";
import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const FORMATTED_SERVICE_ADDRESS = "Formatted Service Address";
const COUNTRY = "England";
const DATE_OF_BIRTH = "12-06-1980";
const NATIONALITY = "nationality";
const COUNTRY_OF_RESIDENCE = "England";
const FORENAME = "DUMMYFORENAME";
const SURNAME = "DUMMYSURNAME";
const DATE_OF_APPOINTMENT = "03 August 2003";
const OCCUPATION = "Occupation";
const IS_CORPORTATE = false;
const ROLE = "Secretary";

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
mockGetActiveOfficerDetails.mockResolvedValue([{
  residentialAddress: {
    country: COUNTRY
  },
  serviceAddress: {
    country: COUNTRY
  },
  dateOfBirth: DATE_OF_BIRTH,
  nationality: NATIONALITY,
  countryOfResidence: COUNTRY_OF_RESIDENCE,
  foreName1: FORENAME,
  surname: SURNAME,
  dateOfAppointment: DATE_OF_APPOINTMENT,
  occupation: OCCUPATION,
  isCorporate: IS_CORPORTATE,
  role: ROLE
} as ActiveOfficerDetails ]);

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
      expect(response.text).toContain("1 secretary");
      expect(response.text).toContain(FORMATTED_SERVICE_ADDRESS);
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
