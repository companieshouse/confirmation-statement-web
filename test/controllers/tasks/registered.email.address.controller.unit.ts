jest.mock("../../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import { REGISTERED_EMAIL_ADDRESS_PATH, CHECK_EMAIL_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { EMAIL_ADDRESS_INVALID, NO_EMAIL_ADDRESS_SUPPLIED } from "../../../src/utils/constants";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Registered email address";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";
const COMPANY_NUMBER = "12345678";

const REGISTERED_EMAIL_ADDRESS_URL = REGISTERED_EMAIL_ADDRESS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Registered Email Address controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("Should navigate to the Registered Email Address page", async () => {
    const response = await request(app).get(REGISTERED_EMAIL_ADDRESS_URL);

    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("What is the registered email address?");
  });

  it("Should redirect to an error page when error is thrown", async () => {
    const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(REGISTERED_EMAIL_ADDRESS_URL);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    // restore original function so it is no longer mocked
    spyGetUrlToPath.mockRestore();
  });

  it("Should proceed to check email page when valid email address entered", async () => {
    const response = await request(app).post(REGISTERED_EMAIL_ADDRESS_URL).send({ registeredEmailAddress: "name@example.com" });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(CHECK_EMAIL_PATH);
  });

  it("Should redisplay with appropriate error message when blank email submitted", async () => {
    const response = await request(app).post(REGISTERED_EMAIL_ADDRESS_URL).send({ registeredEmailAddress: "" });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(NO_EMAIL_ADDRESS_SUPPLIED);
  });

  it("Should redisplay with appropriate error message when invalid email submitted", async () => {
    const response = await request(app).post(REGISTERED_EMAIL_ADDRESS_URL).send({ registeredEmailAddress: "bob" });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(EMAIL_ADDRESS_INVALID);
  });

  it("Should return an error page if error is thrown in post function", async () => {
    const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).post(REGISTERED_EMAIL_ADDRESS_URL);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    // restore original function so it is no longer mocked
    spyGetUrlToPath.mockRestore();
  });

});
