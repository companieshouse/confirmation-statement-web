jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.director.details.service");
jest.mock("../../../src/services/confirmation.statement.service");
jest.mock("../../../src/utils/format");
jest.mock("../../../src/utils/update.confirmation.statement.submission");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { DIRECTOR_DETAILS_ERROR, SECTIONS } from "../../../src/utils/constants";
import { urlUtils } from "../../../src/utils/url";
import { mockActiveOfficerDetails, mockActiveOfficerDetailsFormatted, mockSecureActiveOfficerDetailsFormatted } from "../../mocks/active.director.details.mock";
import { formatAddressForDisplay, formatOfficerDetails } from "../../../src/utils/format";
import { getActiveOfficerDetailsData } from "../../../src/services/active.director.details.service";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

jest.mock("../../../src/middleware/company.authentication.middleware");

const FORMATTED_ADDRESS_LINE = "Formatted Test Address";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetActiveOfficerDetails = getActiveOfficerDetailsData as jest.Mock;
const mockFormatAddressForDisplay = formatAddressForDisplay as jest.Mock;
mockFormatAddressForDisplay.mockReturnValue(FORMATTED_ADDRESS_LINE);
const mockFormatOfficerDetails = formatOfficerDetails as jest.Mock;
mockFormatOfficerDetails.mockReturnValue(mockActiveOfficerDetails);
const mockSendUpdate = sendUpdate as jest.Mock;

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Check the director's details";
const WRONG_OFFICER_PAGE_HEADING = "Incorrect Officer Details";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const ACTIVE_OFFICER_DETAILS_URL = ACTIVE_OFFICERS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Active directors controller tests", () => {

  beforeEach(() => {
    mockFormatAddressForDisplay.mockClear();
    mockFormatOfficerDetails.mockClear();
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetActiveOfficerDetails.mockClear();
    mockFormatOfficerDetails.mockClear();
    mockSendUpdate.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to director's details page", async () => {
      mockGetActiveOfficerDetails.mockResolvedValueOnce(mockActiveOfficerDetailsFormatted);
      mockFormatOfficerDetails.mockReturnValueOnce(mockActiveOfficerDetailsFormatted);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Are the director details correct?");
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.foreName1);
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.foreName2);
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.dateOfBirth);
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.dateOfAppointment);
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.nationality);
      expect(response.text).toContain(FORMATTED_ADDRESS_LINE);
    });

    it("Should navigate to director's details page with no middle name", async () => {
      const fName2 = mockActiveOfficerDetailsFormatted.foreName2;
      mockActiveOfficerDetailsFormatted.foreName2 = undefined;

      mockGetActiveOfficerDetails.mockResolvedValueOnce(mockActiveOfficerDetailsFormatted);
      mockFormatOfficerDetails.mockReturnValueOnce(mockActiveOfficerDetailsFormatted);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Are the director details correct?");
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.foreName1);
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.dateOfBirth);
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.dateOfAppointment);
      expect(response.text).toContain(mockActiveOfficerDetailsFormatted.nationality);
      expect(response.text).toContain(FORMATTED_ADDRESS_LINE);
      expect(response.text).not.toContain(fName2);

      mockActiveOfficerDetailsFormatted.foreName2 = fName2;
    });

    it("Should navigate to director's details page for secure director", async () => {

      mockGetActiveOfficerDetails.mockResolvedValueOnce(mockSecureActiveOfficerDetailsFormatted);
      mockFormatOfficerDetails.mockReturnValueOnce(mockSecureActiveOfficerDetailsFormatted);
      mockFormatAddressForDisplay.mockReturnValueOnce(mockSecureActiveOfficerDetailsFormatted.serviceAddress.addressLine1);
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Are the director details correct?");
      expect(response.text).toContain(mockSecureActiveOfficerDetailsFormatted.foreName1);
      expect(response.text).toContain(mockSecureActiveOfficerDetailsFormatted.dateOfBirth);
      expect(response.text).toContain(mockSecureActiveOfficerDetailsFormatted.dateOfAppointment);
      expect(response.text).toContain(mockSecureActiveOfficerDetailsFormatted.nationality);
      expect(response.text).toContain("Usual residential address");
      expect(response.text).toContain(FORMATTED_ADDRESS_LINE);
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      spyGetUrl.mockRestore();
    });

    it("Should navigate to an error page if the called service throws an error", async () => {
      mockGetActiveOfficerDetails.mockImplementationOnce(() => {throw new Error(); });

      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    });

  });

  describe("post tests", () => {

    it("Should return to task list page when director details is confirmed", async () => {
      const response = await request(app)
        .post(ACTIVE_OFFICER_DETAILS_URL)
        .send({ activeOfficers: "yes" });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_OFFICER);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should go to stop page when director details radio button is no", async () => {
      const response = await request(app)
        .post(ACTIVE_OFFICER_DETAILS_URL)
        .send({ activeOfficers: "no" });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_OFFICER);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(WRONG_OFFICER_PAGE_HEADING);
    });

    it("Should redirect to task list when recently filed radio button is selected", async () => {
      const response = await request(app)
        .post(ACTIVE_OFFICER_DETAILS_URL)
        .send({ activeOfficers: "recently_filed" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_OFFICER);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
    });

    it("Should redisplay active directors page with error when radio button is not selected", async () => {
      const response = await request(app).post(ACTIVE_OFFICER_DETAILS_URL);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(DIRECTOR_DETAILS_ERROR);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);

      // restore original function so it is no longer mocked
      spyGetUrl.mockRestore();
    });
  });
});
