import {urlUtils} from "../../../src/utils/url";

jest.mock("../../../src/middleware/company.authentication.middleware");

import mocks from "../../mocks/all.middleware.mock";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const COMPANY_NUMBER = "12345678";
const PEOPLE_WITH_SIGNIFICANT_CONTROL_URL = PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH.replace(":companyNumber", COMPANY_NUMBER);

describe("People with significant control controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  it("should navigate to the active pscs page", async () => {
    const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
    expect(response.text).toContain("Check the people with significant control (PSC)");
  });

  it("Should navigate to an error page if the function throws an error", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlWithCompanyNumberTransactionIdAndSubmissionId");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });

    const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

    expect(response.text).toContain("Sorry, the service is unavailable");

    spyGetUrlWithCompanyNumber.mockRestore();
  });
});
