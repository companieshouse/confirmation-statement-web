import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_PATH } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { validCompanyOfficers } from "../../mocks/company.officers.mock";
import { getCompanyOfficers } from "../../../src/services/company.officers.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";

jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/company.officers.service");
jest.mock("../../../src/utils/feature.flag");

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
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
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyOfficers.mockResolvedValueOnce(validCompanyOfficers);
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_TEXT);
  });

  it("Should return error page if active officers cannot be retired", async () => {
    const message = "Can't connect";
    mockGetCompanyOfficers.mockRejectedValueOnce(new Error(message));
    mockIsActiveFeature.mockReturnValueOnce(true);
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_ERROR_TEXT);
  });

  it("Should skip officer check and return active officers page if feature flag is off", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_TEXT);
  });
});
