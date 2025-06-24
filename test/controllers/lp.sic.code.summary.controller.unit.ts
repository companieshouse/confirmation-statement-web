import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { LP_SIC_CODE_SUMMARY_PATH } from '../../src/types/page.urls';


describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return SIC Code Check and Confirm page", async () => {
    const response = await request(app)
      .get(LP_SIC_CODE_SUMMARY_PATH);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain("Check and confirm what the limited partnership will be doing");
  });

});
