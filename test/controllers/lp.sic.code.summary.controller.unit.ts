import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { LP_SIC_CODE_SUMMARY_PATH } from "../../src/types/page.urls";
import { dummySicCodes } from "../../src/controllers/lp.sic.code.summary.controller"

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.setTimeout(10000); 
    dummySicCodes.length = 0;
  });

  it("should return SIC Code Check and Confirm page", async () => {
    const response = await request(app)
      .get(LP_SIC_CODE_SUMMARY_PATH);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain("Check and confirm what the limited partnership will be doing");
  });

  it("should add a valid SIC code", async () => {
    const response = await request(app)
      .post(`${LP_SIC_CODE_SUMMARY_PATH}/add`)
      .send({ code: "5678" });

    expect(dummySicCodes).toHaveLength(1);
    expect(dummySicCodes[0]).toEqual({
      code: "5678",
      description: "Description for 5678"
    });
  });

  it("should remove a valid SIC code and redirect", async () => {
    dummySicCodes.push({code: "1234", description: "Test"})

    const response = await request(app)
      .post(`${LP_SIC_CODE_SUMMARY_PATH}/1234/remove?lang=en`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`${LP_SIC_CODE_SUMMARY_PATH}?lang=en`);
    expect(dummySicCodes.some(sic => sic.code === "1234")).toBe(false);
  });  
});
