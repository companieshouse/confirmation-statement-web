jest.mock("../../../src/services/psc.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_PSC_DETAILS_PATH, PSC_STATEMENT_PATH, URL_QUERY_PARAM, urlParams } from "../../../src/types/page.urls";
import { getPscs } from "../../../src/services/psc.service";
import { mockPscList } from "../../mocks/active.psc.details.controller.mock";
import { urlUtils } from "../../../src/utils/url";
import { Templates } from "../../../src/types/template.paths";

const COMPANY_NUMBER = "12345678";
const ACTIVE_PSC_DETAILS_URL = ACTIVE_PSC_DETAILS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const PSC_STATEMENT_URL = PSC_STATEMENT_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const PAGE_HEADING = "Review the people with significant control";

const mockGetPscs = getPscs as jest.Mock;

describe("Active psc details controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetPscs.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to psc page and display individual psc details", async () => {
      mockGetPscs.mockResolvedValueOnce(mockPscList);
      const response = await request(app).get(ACTIVE_PSC_DETAILS_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Joe");
      expect(response.text).toContain("Bloggs");
      expect(response.text).toContain("British");
      expect(response.text).toContain("21 March 1965");
      expect(response.text).toContain("1 January 2012");
      expect(response.text).toContain("10 This Road, This Town, Thisshire, Thisland, TH1 1AB");
      expect(response.text).toContain("Diddly Squat Farm Shop, Chadlington, Thisshire, England, OX7 3PE");
      expect(response.text).toContain("United Kingdom");
      expect(response.text).toContain("75% or more of shares held as a person");
      expect(response.text).toContain("Ownership of voting rights - more than 75%");
    });

    it("Should navigate to psc page and display individual relevant legal entity details", async () => {
      mockGetPscs.mockResolvedValueOnce(mockPscList);
      const response = await request(app).get(ACTIVE_PSC_DETAILS_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("THE LEGAL EAGLE");
      expect(response.text).toContain("1 January 2013");
      expect(response.text).toContain("10 That Road, The Tall City, Thatregion, Neverland, TA1 1TA");
      expect(response.text).toContain("The Law");
      expect(response.text).toContain("The Legal Form");
      expect(response.text).toContain("123456789");
      expect(response.text).toContain("MIDDLE EARTH");
      expect(response.text).toContain("Middle Earth");
      expect(response.text).toContain("50% or more of shares held as a person");
      expect(response.text).toContain("Ownership of voting rights - more than 50%");
    });

    it("Should navigate to psc page and display other registrable person details", async () => {
      mockGetPscs.mockResolvedValueOnce(mockPscList);
      const response = await request(app).get(ACTIVE_PSC_DETAILS_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("THE LEGAL EAGLE");
      expect(response.text).toContain("1 January 2014");
      expect(response.text).toContain("10 That Road, The Tall City, Thatregion, Neverland, TA1 1TA");
      expect(response.text).toContain("UK");
      expect(response.text).toContain("Charity - Unincorporated Association");
      expect(response.text).toContain("Ownership of voting rights - more than 75%");
    });

    it("should navigate to psc statement page if no psc is found", async () => {
      mockGetPscs.mockResolvedValueOnce([ ]);
      const response = await request(app).get(ACTIVE_PSC_DETAILS_URL);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(pscStatementPathWithIsPscParam("false"));
    });

    it("should navigate to psc statement page if pscs is undefined", async () => {
      mockGetPscs.mockResolvedValueOnce(undefined);
      const response = await request(app).get(ACTIVE_PSC_DETAILS_URL);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(pscStatementPathWithIsPscParam("false"));
    });

    it("Should back-link to the task list page", async () => {
      mockGetPscs.mockResolvedValueOnce(mockPscList);
      const response = await request(app).get(ACTIVE_PSC_DETAILS_URL);
      expect(response.text).toContain(Templates.TASK_LIST);
    });
  });
});

const pscStatementPathWithIsPscParam = (isPscParam: string) => {
  return urlUtils.setQueryParam(PSC_STATEMENT_URL, URL_QUERY_PARAM.IS_PSC, isPscParam);
};
