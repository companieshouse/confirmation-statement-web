jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/company.profile.service");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import { REGISTERED_OFFICE_ADDRESS_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { validCompanyProfile } from "../../mocks/company.profile.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const PAGE_HEADING = "Review the registered office address";
const COMPANY_NUMBER = "12345678";

const REGISTERED_OFFICE_ADDRESS_URL = REGISTERED_OFFICE_ADDRESS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

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

});
