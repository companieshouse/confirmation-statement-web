jest.mock("../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { STATEMENT_OF_CAPITAL_PATH } from "../../../src/types/page.urls";
import { getUrlWithCompanyNumber } from "../../../src/utils/url";
import app from "../../../src/app";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Review the statement of capital";
const COMPANY_NUMBER = "12345678";

describe("Statement of Capital controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("should navigate to the statement of capital page", async () => {
    const url = getUrlWithCompanyNumber(STATEMENT_OF_CAPITAL_PATH, COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Check the statement of capital");
  });
});
