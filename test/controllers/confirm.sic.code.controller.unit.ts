import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { SIC_PATH } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";

jest.mock("../../src/middleware/company.authentication.middleware");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";
const EXPECTED_TEXT = "Check the SIC codes";

describe("Confirm sic code controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return sic code page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = SIC_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });
});
