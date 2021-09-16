jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/shareholder.service");
jest.mock("../../../src/utils/update.confirmation.statement.submission");

import mocks from "../../mocks/all.middleware.mock";
import { SHAREHOLDERS_PATH, TASK_LIST_PATH, urlParams } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { urlUtils } from "../../../src/utils/url";
import { SECTIONS, SHAREHOLDERS_ERROR } from "../../../src/utils/constants";
import { getShareholders } from "../../../src/services/shareholder.service";
import { mockShareholder, mockShareholderFormatted } from "../../mocks/shareholder.mock";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetShareholders = getShareholders as jest.Mock;
const mockSendUpdate = sendUpdate as jest.Mock;

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Review the shareholders";
const STOP_PAGE_MESSAGE = "Currently, changes to shareholder details can only be made by filing a confirmation statement";
const SHAREHOLDERS_URL = SHAREHOLDERS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Shareholders controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockGetShareholders.mockClear();
    mockSendUpdate.mockClear();
  });

  it("should navigate to the shareholders page", async () => {
    mockGetShareholders.mockResolvedValueOnce(mockShareholder);
    const response = await request(app).get(SHAREHOLDERS_URL);
    const shareholder = mockShareholderFormatted[0];
    expect(response.text).toContain("Check the shareholder detail");
    expect(response.text).toContain(shareholder.surname);
    expect(response.text).toContain(shareholder.shares);
    expect(response.text).toContain(shareholder.classOfShares);
  });

  it("Should return an error page if error is thrown in get function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlToPath");
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

    expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.SHAREHOLDER);
    expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should navigate to the share holder stop page if shareholder details are incorrect", async () => {
    const response = await request(app)
      .post(SHAREHOLDERS_URL)
      .send({ shareholders: "no" });

    expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.SHAREHOLDER);
    expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
    expect(response.status).toEqual(200);
    expect(response.text).toContain(STOP_PAGE_MESSAGE);
  });

  it("Should return an error page if error is thrown in post function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlToPath");
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
