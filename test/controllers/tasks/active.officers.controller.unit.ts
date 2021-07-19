import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { ACTIVE_OFFICERS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { validCompanyOfficers } from "../../mocks/company.officers.mock";
import { getCompanyOfficers } from "../../../src/services/company.officers.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { OFFICER_DETAILS_ERROR } from "../../../src/utils/constants";
import { urlUtils } from "../../../src/utils/url";

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
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

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

  it("Should return to task list page when officer details is confirmed", async () => {
    const response = await request(app).post(url).send({ activeDirectors: "yes" });
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should redisplay active officers page with error when radio button is not selected", async () => {
    const response = await request(app).post(url);
    expect(response.status).toEqual(200);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.text).toContain(OFFICER_DETAILS_ERROR);
  });

  it("Should return an error page if error is thrown in post function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).post(url);

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });
});
