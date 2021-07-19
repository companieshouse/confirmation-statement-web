jest.mock("../../../src/middleware/company.authentication.middleware");

import mocks from "../../mocks/all.middleware.mock";
import { SHAREHOLDERS_PATH } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";

describe("Shareholders controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  it("should navigate to the shareholders page", async () => {
    const url = SHAREHOLDERS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain("Check the shareholder detail");
  });
});
