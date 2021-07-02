jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/company.profile.service");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import { REGISTERED_OFFICE_ADDRESS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { validCompanyProfile } from "../../mocks/company.profile.mock";
import { REGISTERED_OFFICE_ADDRESS_ERROR } from "../../../src/utils/constants";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const PAGE_HEADING = "Review the registered office address";
const COMPANY_NUMBER = "12345678";

const REGISTERED_OFFICE_ADDRESS_URL = REGISTERED_OFFICE_ADDRESS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Registered Office Address controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("Should navigate to the Registered Office Address page", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const response = await request(app).get(REGISTERED_OFFICE_ADDRESS_URL);

    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Check the registered office address");
    expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
    expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineTwo);
    expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
  });

  it("Should redirect to an error page when error is thrown", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(REGISTERED_OFFICE_ADDRESS_URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });

  it("Should return to task list page when roa is confirmed", async () => {
    const response = await request(app).post(REGISTERED_OFFICE_ADDRESS_URL).send({ registeredOfficeAddress: "yes" });
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should redisplay statement of capital page with error when radio button is not selected", async () => {
    const response = await request(app).post(REGISTERED_OFFICE_ADDRESS_URL);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(REGISTERED_OFFICE_ADDRESS_ERROR);
    expect(response.text).toContain("Check the registered office address");
  });

  it("Should return an error page if error is thrown in post function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).post(REGISTERED_OFFICE_ADDRESS_URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });

});
