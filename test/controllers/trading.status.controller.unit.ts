jest.mock("../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import app from "../../src/app";
import { TRADING_STATUS_PATH } from "../../src/types/page.urls";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Check the trading status of shares";
const COMPANY_NUMBER = "11111111";

describe("Trading status controller tests", () => {

  it("Should navigate to the trading status page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(PAGE_HEADING);
  });
});
