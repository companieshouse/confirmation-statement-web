jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/middleware/session.middleware");

import { getCompanyProfile } from "../../src/services/company.profile.service";
import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import app from "../../src/app";
import { TRADING_STATUS_PATH } from "../../src/types/page.urls";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { getSessionRequest } from "../mocks/session.mock";
import { validCompanyProfile } from "../mocks/company.profile.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const PAGE_HEADING = "Check the trading status of shares";
const COMPANY_NUMBER = "12345678";

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req, res, next) => {
  req.session = getSessionRequest(COMPANY_NUMBER, { access_token: "token" });
  return next();
});


describe("Trading status controller tests", () => {

  it("Should navigate to the trading status page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(PAGE_HEADING);
  });

  it("Should navigate to the task list page", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TRADING_STATUS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).post(url);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/confirmation-statement/company/12345678/task-list");
  });
});