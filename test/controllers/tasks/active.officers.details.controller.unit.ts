jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.officers.details.service");
jest.mock("../../../src/services/confirmation.statement.service");
jest.mock("../../../src/utils/format");
jest.mock("../../../src/utils/update.confirmation.statement.submission");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_DETAILS_PATH, CORPORATE_DIRECTORS_PATH, CORPORATE_SECRETARIES_PATH, NATURAL_PERSON_DIRECTORS_PATH, NATURAL_PERSON_SECRETARIES_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { getActiveOfficersDetailsData, getOfficerTypeList } from "../../../src/services/active.officers.details.service";

jest.mock("../../../src/middleware/company.authentication.middleware");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetActiveOfficerDetails = getActiveOfficersDetailsData as jest.Mock;
const mockGetOfficerTypeList = getOfficerTypeList as jest.Mock;

const COMPANY_NUMBER = "12345678";
const ACTIVE_OFFICER_DETAILS_URL = ACTIVE_OFFICERS_DETAILS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const CORPORATE_SECRETARIES_URL = CORPORATE_SECRETARIES_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const CORPORATE_DIRECTORS_URL = CORPORATE_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const NATURAL_PERSON_SECRETARIES_URL = NATURAL_PERSON_SECRETARIES_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const NATURAL_PERSON_DIRECTORS_URL = NATURAL_PERSON_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Active directors controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetActiveOfficerDetails.mockClear();
    mockGetOfficerTypeList.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to natural secretary page if natural secretary is present", async () => {
      mockGetOfficerTypeList.mockReturnValue([
        "naturalSecretary",
        "corporateSecretary"
      ]);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.header.location).toEqual(NATURAL_PERSON_SECRETARIES_URL);
    });

    it("Should navigate to corporate secretary page if corporate secretary is present", async () => {
      mockGetOfficerTypeList.mockReturnValue([
        "corporateSecretary",
        "naturalDirector"
      ]);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.header.location).toEqual(CORPORATE_SECRETARIES_URL);
    });

    it("Should navigate to natural director page if natural director is present", async () => {
      mockGetOfficerTypeList.mockReturnValue([
        "naturalDirector",
        "corporateDirector"
      ]);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.header.location).toEqual(NATURAL_PERSON_DIRECTORS_URL);
    });

    it("Should navigate to corporate director page if corporate director is present", async () => {
      mockGetOfficerTypeList.mockReturnValue([
        "corporateDirector",
      ]);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.header.location).toEqual(CORPORATE_DIRECTORS_URL);
    });

    it("Should navigate to an error page if the called service throws an error", async () => {
      mockGetActiveOfficerDetails.mockImplementationOnce(() => {throw new Error(); });

      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    });

    it("Should throw an error if list of officer is empty", async () => {
      mockGetOfficerTypeList.mockReturnValue([]);

      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain("Sorry, the service is unavailable");
    });

  });
});
