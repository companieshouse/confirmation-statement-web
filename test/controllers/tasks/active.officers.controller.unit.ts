import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_PATH } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { urlUtils } from "../../../src/utils/url";

jest.mock("../../../src/middleware/company.authentication.middleware");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";
const EXPECTED_TEXT = "Review the directors";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";

describe("Active officers controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  it("should return active officers page", async () => {
    const url = ACTIVE_OFFICERS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_TEXT);
  });

  it("Should return an error page if error is thrown when Company Profile is missing confirmation statement", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const url = ACTIVE_OFFICERS_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });
});
