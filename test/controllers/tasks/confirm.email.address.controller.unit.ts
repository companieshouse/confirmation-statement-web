jest.mock("../../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import { urlParams, CONFIRM_EMAIL_PATH } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Check the email address";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const COMPANY_NUMBER = "12345678";

const CONFIRM_EMAIL_ADDRESS_URL = CONFIRM_EMAIL_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Confirm Email Address controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("Should navigate to the Confirm Email Address page", async () => {
    const response = await request(app).get(CONFIRM_EMAIL_ADDRESS_URL);

    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Email address");
  });

  it("Should redirect to an error page when error is thrown", async () => {
    const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(CONFIRM_EMAIL_ADDRESS_URL);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    spyGetUrlToPath.mockRestore();
  });
});
