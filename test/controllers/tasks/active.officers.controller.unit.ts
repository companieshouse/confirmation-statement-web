import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_PATH } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { validCompanyOfficers } from "../../mocks/company.officers.mock";
import { getCompanyOfficers } from "../../../src/services/company.officers.service";

jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/company.officers.service");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";
const EXPECTED_TEXT = "Review the directors";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const url = ACTIVE_OFFICERS_PATH.replace(":companyNumber", COMPANY_NUMBER);

describe("Active officers controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  it("Should return active officers page", async () => {
    mockGetCompanyOfficers.mockResolvedValueOnce(validCompanyOfficers);
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_TEXT);
  });

  it("Should return error page if active officers cannot be retired", async () => {
    const message = "Can't connect";
    mockGetCompanyOfficers.mockRejectedValueOnce(new Error(message));
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_ERROR_TEXT);
  });
});
