jest.mock("../../../src/middleware/company.authentication.middleware");

import mocks from "../../mocks/all.middleware.mock";
import { SHAREHOLDERS_PATH, TASK_LIST_PATH } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { urlUtils } from "../../../src/utils/url";
import { SHAREHOLDERS_ERROR } from "../../../src/utils/constants";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Review the shareholders";
const STOP_PAGE_MESSAGE = "Currently, changes to shareholder details can only be made by filing a confirmation statement";
const SHAREHOLDERS_URL = SHAREHOLDERS_PATH.replace(":companyNumber", COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);

describe("Shareholders controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  it("should navigate to the shareholders page", async () => {
    const response = await request(app).get(SHAREHOLDERS_URL);
    expect(response.text).toContain("Check the shareholder detail");
  });

  it("Should return an error page if error is thrown in get function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(SHAREHOLDERS_URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });

  it("Should navigate to the task list page when shareholder details confirmed", async () => {
    const response = await request(app)
      .post(SHAREHOLDERS_URL)
      .send({ shareholders: "yes" });

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should navigate to the share holder stop page if shareholder details are incorrect", async () => {
    const response = await request(app)
      .post(SHAREHOLDERS_URL)
      .send({ shareholders: "no" });

    expect(response.status).toEqual(200);
    expect(response.text).toContain(STOP_PAGE_MESSAGE);
  });

  it("Should return an error page if error is thrown in post function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumber");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).post(SHAREHOLDERS_URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });

  it("Should throw an error on shareholders page when radio button is not selected", async () => {
    const response = await request(app).post(SHAREHOLDERS_URL);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(SHAREHOLDERS_ERROR);
    expect(response.text).toContain("Check the shareholder detail");
  });

});
