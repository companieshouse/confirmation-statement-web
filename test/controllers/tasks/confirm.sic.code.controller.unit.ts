const SIC_CODE = "123";
const SIC_CODE_DESCRIPTIONS = "Test SIC code descriptions";
const COMPANY_NUMBER = "12345678";
const EXPECTED_TEXT = "Check the SIC codes";
const SIC_CODE_DETAILS = "<strong>" + SIC_CODE + "</strong> - " + SIC_CODE_DESCRIPTIONS;
const SIC_CODE_ERROR_HEADING = "There is a problem";
const STOP_PAGE_TEXT = "Currently, changes to the company SIC codes can only be made by filing a confirmation statement";

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { SIC_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { urlUtils } from "../../../src/utils/url";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { validCompanyProfile } from "../../mocks/company.profile.mock";
import { SIC_CODE_ERROR } from "../../../src/utils/constants";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const SIC_CODE_URL = SIC_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/company.profile.service");
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
    const response = await request(app).get(SIC_CODE_URL);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.text).toContain(SIC_CODE_DETAILS);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should display sic code stop screen if sic code details are incorrect", async () => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const response = await request(app).post(SIC_CODE_URL).send({ sicCodeStatus: "no" });
    expect(response.status).toEqual(200);
    expect(response.text).toContain(STOP_PAGE_TEXT);
    expect(response.text).not.toContain(SIC_CODE_DETAILS);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should return to task list page when Sic code is confirmed", async () => {
    const response = await request(app).post(SIC_CODE_URL).send({ sicCodeStatus: "yes" });
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should reload sic code page with an error message", async () => {
    const response = await request(app).post(SIC_CODE_URL).send();
    expect(response.status).toEqual(200);
    expect(response.text).toContain(SIC_CODE_ERROR);
    expect(response.text).toContain(SIC_CODE_ERROR_HEADING);
  });

  it("Should return an error page if error is thrown on submission", async () => {

    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).post(SIC_CODE_URL).send();
    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should return an error page if error is thrown when Company Profile is missing confirmation statement", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(SIC_CODE_URL);
    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });

});
