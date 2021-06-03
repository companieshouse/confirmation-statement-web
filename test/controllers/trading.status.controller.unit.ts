jest.mock("../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import app from "../../src/app";
import { TRADING_STATUS_PATH } from "../../src/types/page.urls";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Check the trading status of shares";
const COMPANY_NUMBER = "12345678";


describe("Trading status controller tests", () => {

  it("Should navigate to the trading status page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(PAGE_HEADING);
  });

  it("Should navigate to the task list page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).post(url);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/confirmation-statement/company/12345678/task-list");
  });
});
