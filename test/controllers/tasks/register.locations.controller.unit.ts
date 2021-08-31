jest.mock("../../../src/middleware/company.authentication.middleware");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import { REGISTER_LOCATIONS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { RADIO_BUTTON_VALUE, REGISTER_LOCATIONS_ERROR } from "../../../src/utils/constants";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const PAGE_HEADING = "Review where the company records are held";

const COMPANY_NUMBER = "12345678";
const STOP_PAGE_MESSAGE = "You will need to update the company details";
const REGISTER_LOCATIONS_URL = REGISTER_LOCATIONS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Register locations controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("Should navigate to the Register locations page", async () => {
    const response = await request(app).get(REGISTER_LOCATIONS_URL);

    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Check where the company records are kept");
  });

  it("Should redirect to an error page when error is thrown", async () => {
    const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(REGISTER_LOCATIONS_URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlToPath.mockRestore();
  });

  it("Should navigate to the task list page when register locations are confirmed", async () => {
    const response = await request(app)
      .post(REGISTER_LOCATIONS_URL)
      .send({ registers: RADIO_BUTTON_VALUE.YES });
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should redirect to task list when recently filed radio button is selected", async () => {
    const response = await request(app)
      .post(REGISTER_LOCATIONS_URL)
      .send({ registers: RADIO_BUTTON_VALUE.RECENTLY_FILED });
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should navigate to the register locations stop page if details are incorrect", async () => {
    const response = await request(app)
      .post(REGISTER_LOCATIONS_URL)
      .send({ registers: RADIO_BUTTON_VALUE.NO });
    expect(response.status).toEqual(200);
    expect(response.text).toContain(STOP_PAGE_MESSAGE);
  });

  it("Should return an error page if error is thrown in post function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).post(REGISTER_LOCATIONS_URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });

  it("Should throw an error on register locations page when radio button is not selected", async () => {
    const response = await request(app).post(REGISTER_LOCATIONS_URL);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(REGISTER_LOCATIONS_ERROR);
  });

});
