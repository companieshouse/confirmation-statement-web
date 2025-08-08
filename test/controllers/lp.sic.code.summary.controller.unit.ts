import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { REVIEW_PATH, LP_REVIEW_PATH, LP_SIC_CODE_SUMMARY_PATH, urlParams } from "../../src/types/page.urls";
import { dummySicCodes } from "../../src/controllers/lp.sic.code.summary.controller";
import * as limitedPartnershipUtils from "../../src/utils/limited.partnership";

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = LP_SIC_CODE_SUMMARY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

jest.mock("../../src/services/company.profile.service", () => ({
  getCompanyProfile: jest.fn()
}));

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.setTimeout(15000);
    dummySicCodes.length = 0;
    jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(true);
  });

  it("should return SIC Code Check and Confirm page", async () => {
    const response = await request(app)
      .get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain("Check and confirm what the limited partnership will be doing");
  });

  it("should add a valid SIC code", async () => {
    await request(app)
      .post(`${URL}/add`)
      .send({ code: "5678" });

    expect(dummySicCodes).toHaveLength(1);
    expect(dummySicCodes[0]).toEqual({
      code: "5678",
      description: "Description for 5678"
    });
  });

  it("should remove a valid SIC code and redirect", async () => {
    dummySicCodes.push(
      { code: "1234", description: "Test" },
      { code: "5678", description: "Test 2" }
    );

    const response = await request(app)
      .post(`${URL}/1234/remove?lang=en`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`${URL}?lang=en`);
    expect(dummySicCodes.some(sic => sic.code === "1234")).toBe(false);
  });

  it("should not add a duplicate SIC code", async () => {
    dummySicCodes.push({ code: "5678", description: "Description for 5678" });

    await request(app)
      .post(`${URL}/add`)
      .send({ code: "5678" });

    expect(dummySicCodes).toHaveLength(1);
  });

  it("should not add more than 4 SIC codes", async () => {
    dummySicCodes.push(
      { code: "1111", description: "desc" },
      { code: "2222", description: "desc" },
      { code: "3333", description: "desc" },
      { code: "4444", description: "desc" }
    );

    await request(app)
      .post(`${URL}/add`)
      .send({ code: "5555" });

    expect(dummySicCodes).toHaveLength(4);
    expect(dummySicCodes.some(sc => sc.code === "5555")).toBe(false);
  });

  it("should not remove the only remaining SIC code", async () => {
    dummySicCodes.push({ code: "9999", description: "desc" });

    const response = await request(app)
      .post(`${URL}/9999/remove?lang=en`);

    expect(dummySicCodes).toHaveLength(1);
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`${URL}?lang=en`);
  });
});

describe("SIC code summary post tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dummySicCodes.length = 0;
    jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(true);
  });

  it("should redirect to review page when valid SIC codes present", async () => {
    dummySicCodes.push(
      { code: "1234", description: "Test" },
      { code: "5678", description: "Test 2" }
    );

    const response = await request(app)
      .post(URL)
      .send();

    const reviewPath = LP_REVIEW_PATH
      .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
      .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
      .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(reviewPath);
  });

  it("should redirect to review page when valid SIC codes present and BODY journey", async () => {
    dummySicCodes.push(
      { code: "1234", description: "Test" },
      { code: "5678", description: "Test 2" }
    );

    jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(false);

    const response = await request(app)
      .post(URL)
      .send();

    const reviewPath = REVIEW_PATH
      .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
      .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
      .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(reviewPath);
  });
});
