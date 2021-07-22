jest.mock("../../../src/middleware/company.authentication.middleware");

import mocks from "../../mocks/all.middleware.mock";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";

describe("People with significant control controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  it("should navigate to the active pscs page", async () => {
    const url = PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain("Check the people with significant control (PSC)");
  });
});
