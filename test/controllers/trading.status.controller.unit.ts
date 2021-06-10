import { TRADING_STATUS_ERROR } from "../../src/utils/constants";

jest.mock("../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import app from "../../src/app";
import { TRADING_STATUS_PATH } from "../../src/types/page.urls";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Check the trading status";
const STOP_PAGE_HEADING = "Trading status not supported";
const COMPANY_NUMBER = "12345678";


describe("Trading status controller tests", () => {

  it("Should navigate to the trading status page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("No company shares were traded on a market during this confirmation period.");
  });

  it("Should navigate to the task list page when trading status is correct", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app)
      .post(url)
      .send({ tradingStatus: "yes" });
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/confirmation-statement/company/12345678/task-list");
  });

  it("Should display stop page when trading status is not correct", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app)
      .post(url)
      .send({ tradingStatus: "no" });
    expect(response.status).toEqual(200);
    expect(response.header.location).not.toEqual("/confirmation-statement/company/12345678/task-list");
    expect(response.text).toContain(STOP_PAGE_HEADING);
  });

  it("Should redisplay trading status page with error when trading status is not selected", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).post(url);
    expect(response.status).toEqual(200);
    expect(response.header.location).not.toEqual("/confirmation-statement/company/12345678/task-list");
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(TRADING_STATUS_ERROR);
  });
});
