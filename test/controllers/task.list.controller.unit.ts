jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/middleware/session.middleware");

import { TASK_LIST_PATH } from "../../src/types/page.urls";
import request from "supertest";
import app from "../../src/app";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { getSessionRequest } from "../mocks/session.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const COMPANY_NUMBER = "12345678";

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req, res, next) => {
  req.session = getSessionRequest(COMPANY_NUMBER, { access_token: "token" });
  return next();
});

describe("Task list controller tests", () => {

  it("Should navigate to the task list page", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain("You will need to check and confirm that the company information we have on record is correct");
  });
});
