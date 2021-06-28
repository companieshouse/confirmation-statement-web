const SIC_CODE = "123";
const SIC_CODE_DESCRIPTIONS = "Test SIC code descriptions";
const COMPANY_NUMBER = "12345678";
const EXPECTED_TEXT = "Check the SIC codes";
const SIC_CODE_DETAILS = "<strong>" + SIC_CODE + "</strong> - " + SIC_CODE_DESCRIPTIONS;
const STOP_PAGE_TEXT = "Currently, changes to the company SIC codes can only be made by filing a confirmation statement";

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { SIC_PATH } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { getUrlWithCompanyNumber } from "../../../src/utils/url";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { validCompanyProfile } from "../../mocks/company.profile.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetUrlWithCompanyNumber = getUrlWithCompanyNumber as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/utils/url");
jest.mock("js-yaml", () => {
  return {
    load: jest.fn(() => {
      return {
        sic_descriptions: {
          [SIC_CODE]: SIC_CODE_DESCRIPTIONS
        }
      };
    }),
  };
});

describe("Confirm sic code controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return sic code page", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const url = SIC_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.text).toContain(SIC_CODE_DETAILS);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should display sic code stop screen if sic code details are incorrect", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const url = SIC_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).post(url).send({ sic: "no" });
    expect(response.status).toEqual(200);
    expect(response.text).toContain(STOP_PAGE_TEXT);
    expect(response.text).not.toContain(SIC_CODE_DETAILS);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should return an error page if error is thrown when Company Profile is missing confirmation statement", async () => {
    mockGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const url = SIC_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

});
