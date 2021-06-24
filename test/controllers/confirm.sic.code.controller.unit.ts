import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { SIC_PATH, TASK_LIST_PATH } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { getCompanyProfile } from "../../src/services/company.profile.service";

jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/company.profile.service");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

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

  it("Should return an error page if error is thrown when Company Profile is missing confirmation statement", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

});
