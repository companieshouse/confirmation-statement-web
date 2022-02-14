jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/active.officers.details.service");
jest.mock("../../../src/services/confirmation.statement.service");
jest.mock("../../../src/utils/update.confirmation.statement.submission");
jest.mock("../../../src/utils/api.enumerations");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import {
  ACTIVE_OFFICERS_DETAILS_PATH,
  TASK_LIST_PATH,
  urlParams,
  WRONG_DETAILS_PATH
} from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { getActiveOfficersDetailsData } from "../../../src/services/active.officers.details.service";
import {
  mockActiveOfficersDetails,
  mockCorporateOfficerWithNullIdentificationType } from "../../mocks/active.officers.details.mock";
import { lookupIdentificationType } from "../../../src/utils/api.enumerations";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { OFFICER_DETAILS_ERROR, SECTIONS } from "../../../src/utils/constants";
import { urlUtils } from "../../../src/utils/url";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetActiveOfficerDetails = getActiveOfficersDetailsData as jest.Mock;
mockGetActiveOfficerDetails.mockResolvedValue(mockActiveOfficersDetails);
const mockLookupIdentificationType = lookupIdentificationType as jest.Mock;
const mockSendUpdate = sendUpdate as jest.Mock;

const COMPANY_NUMBER = "12345678";
const ACTIVE_OFFICER_DETAILS_URL = ACTIVE_OFFICERS_DETAILS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const PAGE_HEADING = "Check the officers' details";
const WRONG_DETAILS_URL = WRONG_DETAILS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Active officers details controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetActiveOfficerDetails.mockClear();
    mockLookupIdentificationType.mockClear();
    mockSendUpdate.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to active officers details page", async () => {
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display non corporate secretary details", async () => {
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(mockGetActiveOfficerDetails).toHaveBeenCalled();
      expect(response.text).toContain("West");
      expect(response.text).toContain("HAM");
      expect(response.text).toContain("1 January 2009");
      expect(response.text).toContain("10 Secretary Road, Secrettown, Secretshire, Secretland, SE1 7SE");
    });

    it("Should display non corporate director details", async () => {
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(mockGetActiveOfficerDetails).toHaveBeenCalled();
      expect(response.text).toContain("John");
      expect(response.text).toContain("DOE");
      expect(response.text).toContain("1 January 1965");
      expect(response.text).toContain("1 January 2012");
      expect(response.text).toContain("Diddly Squat Farm Shop, Chadlington, Thisshire, England, OX7 3PE");
      expect(response.text).toContain("Abc, 1, 10, 10 This Road, This, This Town, Thisshire, Thisland, TH1 1AB");
      expect(response.text).toContain("Singer");
      expect(response.text).toContain("British");
      expect(response.text).toContain("United Kingdom");
    });

    it("Should display corporate secretary details", async () => {
      mockLookupIdentificationType.mockReturnValueOnce("Non European Economic Area");
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(mockGetActiveOfficerDetails).toHaveBeenCalled();
      expect(response.text).toContain("MYERS");
      expect(response.text).toContain("10 Corpsecret Road, Corpsecrettown, Corpsecretshire, Corpsecretland, CS1 7SC");
      expect(response.text).toContain("1 January 2010");
      expect(response.text).toContain("Specific Law");
      expect(response.text).toContain("11223344");
      expect(response.text).toContain("Non European Economic Area");
      expect(response.text).toContain("British");
      expect(response.text).toContain("United Kingdom");
      expect(response.text).toContain("PRIVATE LIMITED");
      expect(response.text).toContain("Specific Law");
      expect(response.text).toContain("Scunthorpe");
    });

    it("Should display corporate director details", async () => {
      mockLookupIdentificationType.mockReturnValueOnce("UK Limited Company");
      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(mockGetActiveOfficerDetails).toHaveBeenCalled();
      expect(response.text).toContain("COMPANY LTD");
      expect(response.text).toContain("10 Corpdir Road, Corpdirtown, Corpdirshire, Corpdirland, CD1 7DC");
      expect(response.text).toContain("1 January 2011");
      expect(response.text).toContain("Company Law");
      expect(response.text).toContain("11111111");
      expect(response.text).toContain("UK Limited Company");
      expect(response.text).toContain("British");
      expect(response.text).toContain("United Kingdom");
      expect(response.text).toContain("Stranraer");
      expect(response.text).toContain("LLC");
    });

    it("Should navigate to an error page if the called service throws an error", async () => {
      mockGetActiveOfficerDetails.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    });

    it("Should not call identification type lookup when identification type is null", async () => {
      mockGetActiveOfficerDetails.mockReturnValueOnce([
        mockCorporateOfficerWithNullIdentificationType]);

      await request(app).get(ACTIVE_OFFICER_DETAILS_URL);

      expect(mockLookupIdentificationType).not.toHaveBeenCalled();
    });
  });

  describe("post tests", () => {

    it("Should return to task list page when officer details are confirmed", async () => {
      const response = await request(app)
        .post(ACTIVE_OFFICER_DETAILS_URL)
        .send({ activeOfficers: "yes" });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_OFFICER);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(TASK_LIST_URL);
    });

    it("Should go to stop page when officer details radio button is no", async () => {
      const response = await request(app)
        .post(ACTIVE_OFFICER_DETAILS_URL)
        .send({ activeOfficers: "no" });

      expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.ACTIVE_OFFICER);
      expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(WRONG_DETAILS_URL);
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

    it("Should redisplay active officers details page with error when radio button is not selected", async () => {
      const response = await request(app).post(ACTIVE_OFFICER_DETAILS_URL);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(OFFICER_DETAILS_ERROR);
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
