jest.mock("../../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import { CHECK_EMAIL_ADDRESS_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import * as reaService from "../../../src/services/registered.email.address.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Check registered email address";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const EXPECTED_EMAIL = "test@email.com";
const COMPANY_NUMBER = "12345678";

const CHECK_EMAIL_ADDRESS_URL = CHECK_EMAIL_ADDRESS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Check registered email address controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("Should navigate to the Check registered email address page", async () => {
    jest.spyOn(reaService, "getRegisteredEmailAddress").mockReturnValueOnce(Promise.resolve(EXPECTED_EMAIL));

    const response = await request(app).get(CHECK_EMAIL_ADDRESS_URL);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Is the registered email address correct?");
    expect(response.text).toContain(EXPECTED_EMAIL);
  });

  it("Should redirect to an error page when error is thrown", async () => {
    const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(CHECK_EMAIL_ADDRESS_URL);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    // restore original function so it is no longer mocked
    spyGetUrlToPath.mockRestore();
  });

});
