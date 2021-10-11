jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.director.details.service");
jest.mock("../../../src/services/confirmation.statement.service");
jest.mock("../../../src/utils/format");
jest.mock("../../../src/utils/update.confirmation.statement.submission");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_DIRECTORS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { DIRECTOR_DETAILS_ERROR, SECTIONS } from "../../../src/utils/constants";
import { urlUtils } from "../../../src/utils/url";
import { mockActiveDirectorDetails, mockActiveDirectorDetailsFormatted, mockSecureActiveDirectorDetailsFormatted } from "../../mocks/active.director.details.mock";
import { formatAddressForDisplay, formatDirectorDetails } from "../../../src/utils/format";
import { getActiveDirectorDetailsData } from "../../../src/services/active.director.details.service";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

jest.mock("../../../src/middleware/company.authentication.middleware");

const FORMATTED_ADDRESS_LINE = "Formatted Test Address";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetActiveDirectorDetails = getActiveDirectorDetailsData as jest.Mock;
const mockFormatAddressForDisplay = formatAddressForDisplay as jest.Mock;
mockFormatAddressForDisplay.mockReturnValue(FORMATTED_ADDRESS_LINE);
const mockFormatDirectorDetails = formatDirectorDetails as jest.Mock;
mockFormatDirectorDetails.mockReturnValue(mockActiveDirectorDetails);
const mockSendUpdate = sendUpdate as jest.Mock;

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Check the director's details";
const WRONG_OFFICER_PAGE_HEADING = "Update officers - File a confirmation statement";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const ACTIVE_DIRECTOR_DETAILS_URL = ACTIVE_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Active directors controller tests", () => {

  beforeEach(() => {
    mockFormatAddressForDisplay.mockClear();
    mockFormatDirectorDetails.mockClear();
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetActiveDirectorDetails.mockClear();
    mockFormatDirectorDetails.mockClear();
    mockSendUpdate.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to director's details page", async () => {
      mockGetActiveDirectorDetails.mockResolvedValueOnce(mockActiveDirectorDetailsFormatted);
      mockFormatDirectorDetails.mockReturnValueOnce(mockActiveDirectorDetailsFormatted);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Are the director details correct?");
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.foreName1);
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.foreName2);
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.dateOfBirth);
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.dateOfAppointment);
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.nationality);
      expect(response.text).toContain(FORMATTED_ADDRESS_LINE);
    });

    it("Should navigate to director's details page with no middle name", async () => {
      const fName2 = mockActiveDirectorDetailsFormatted.foreName2;
      mockActiveDirectorDetailsFormatted.foreName2 = undefined;

      mockGetActiveDirectorDetails.mockResolvedValueOnce(mockActiveDirectorDetailsFormatted);
      mockFormatDirectorDetails.mockReturnValueOnce(mockActiveDirectorDetailsFormatted);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Are the director details correct?");
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.foreName1);
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.dateOfBirth);
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.dateOfAppointment);
      expect(response.text).toContain(mockActiveDirectorDetailsFormatted.nationality);
      expect(response.text).toContain(FORMATTED_ADDRESS_LINE);
      expect(response.text).not.toContain(fName2);

      mockActiveDirectorDetailsFormatted.foreName2 = fName2;
    });

    it("Should navigate to director's details page for secure director", async () => {

      mockGetActiveDirectorDetails.mockResolvedValueOnce(mockSecureActiveDirectorDetailsFormatted);
      mockFormatDirectorDetails.mockReturnValueOnce(mockSecureActiveDirectorDetailsFormatted);
      mockFormatAddressForDisplay.mockReturnValueOnce(mockSecureActiveDirectorDetailsFormatted.serviceAddress.addressLine1);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Are the director details correct?");
      expect(response.text).toContain(mockSecureActiveDirectorDetailsFormatted.foreName1);
      expect(response.text).toContain(mockSecureActiveDirectorDetailsFormatted.dateOfBirth);
      expect(response.text).toContain(mockSecureActiveDirectorDetailsFormatted.dateOfAppointment);
      expect(response.text).toContain(mockSecureActiveDirectorDetailsFormatted.nationality);
      expect(response.text).toContain("Usual residential address");
      expect(response.text).toContain(FORMATTED_ADDRESS_LINE);
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      spyGetUrl.mockRestore();
    });

    it("Should navigate to an error page if the called service throws an error", async () => {
      mockGetActiveDirectorDetails.mockImplementationOnce(() => {throw new Error(); });

      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    });

  });

  describe("post tests", () => {

    it("Should return to task list page when director details is confirmed", async () => {
      const response = await request(app)
        .post(ACTIVE_DIRECTOR_DETAILS_URL)
        .send({ activeDirectors: "yes" });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_DIRECTOR);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should go to stop page when director details radio button is no", async () => {
      const response = await request(app)
        .post(ACTIVE_DIRECTOR_DETAILS_URL)
        .send({ activeDirectors: "no" });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_DIRECTOR);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_OFFICER_PAGE_HEADING);
    });

    it("Should redirect to task list when recently filed radio button is selected", async () => {
      const response = await request(app)
        .post(ACTIVE_DIRECTOR_DETAILS_URL)
        .send({ activeDirectors: "recently_filed" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_DIRECTOR);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
    });

    it("Should redisplay active directors page with error when radio button is not selected", async () => {
      const response = await request(app).post(ACTIVE_DIRECTOR_DETAILS_URL);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(DIRECTOR_DETAILS_ERROR);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrl.mockRestore();
    });
  });
});
