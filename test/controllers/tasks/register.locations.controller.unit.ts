jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/register.location.service");
jest.mock("../../../src/utils/update.confirmation.statement.submission");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import {
  REGISTER_LOCATIONS_PATH,
  TASK_LIST_PATH,
  urlParams,
  WRONG_REGISTER_LOCATIONS_PATH
} from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { RADIO_BUTTON_VALUE, REGISTER_LOCATIONS_ERROR, SECTIONS } from "../../../src/utils/constants";
import { sendUpdate } from "../../../src/utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getRegisterLocationData } from "../../../src/services/register.location.service";
import { mockRegisterLocation, mockRegisterLocationNoReg, mockRegisterLocationNoRegNoSail } from "../../mocks/register.location.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetRegisterLocation = getRegisterLocationData as jest.Mock;
const mockSendUpdate = sendUpdate as jest.Mock;

const PAGE_HEADING = "Review where the company records are held";
const SAIL_HEADING = "SAIL (Single Alternative Inspection Location)";
const NO_RECORDS_SAIL = "There are currently no records held at the SAIL addres";
const ALL_RECORDS_MESSAGE = "All company records are kept at the registered office address, or on the public record.";
const OTHER_RECORDS_MESSAGE = "Any other company records are kept at the registered office address, or on the public record.";
const EXPECTED_ERROR_TEXT = "Sorry, the service is unavailable";

const COMPANY_NUMBER = "12345678";
const REGISTER_LOCATIONS_URL = REGISTER_LOCATIONS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const TASK_LIST_URL = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const WRONG_REGISTER_LOCATIONS_URL = WRONG_REGISTER_LOCATIONS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Register locations controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetRegisterLocation.mockClear();
    mockSendUpdate.mockClear();
  });

  it("Should navigate to the Register locations page", async () => {
    mockGetRegisterLocation.mockResolvedValueOnce(mockRegisterLocation);
    const response = await request(app).get(REGISTER_LOCATIONS_URL);
    const registerLocation = mockRegisterLocation[0];
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Check where the company records are kept");
    expect(response.text).toContain(SAIL_HEADING);
    expect(response.text).toContain(registerLocation.registerTypeDesc);
    expect(response.text).toContain(registerLocation.sailAddress?.addressLine1);
    expect(response.text).toContain(OTHER_RECORDS_MESSAGE);
  });

  it("Should display records kept elsewhere message if no registers at sail address", async () => {
    mockGetRegisterLocation.mockResolvedValueOnce(mockRegisterLocationNoReg);
    const response = await request(app).get(REGISTER_LOCATIONS_URL);
    const registerLocation = mockRegisterLocationNoReg[0];
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Check where the company records are kept");
    expect(response.text).toContain(SAIL_HEADING);
    expect(response.text).toContain(NO_RECORDS_SAIL);
    expect(response.text).toContain(ALL_RECORDS_MESSAGE);
    expect(response.text).toContain(registerLocation.sailAddress?.addressLine1);
  });

  it("Should display no records if company has no sail address", async () => {
    mockGetRegisterLocation.mockResolvedValueOnce(mockRegisterLocationNoRegNoSail);
    const response = await request(app).get(REGISTER_LOCATIONS_URL);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain("Check where the company records are kept");
    expect(response.text).toContain(ALL_RECORDS_MESSAGE);
    expect(response.text).not.toContain(SAIL_HEADING);
  });

  it("Should redirect to an error page when error is thrown", async () => {
    const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(REGISTER_LOCATIONS_URL);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    // restore original function so it is no longer mocked
    spyGetUrlToPath.mockRestore();
  });

  it("Should navigate to the task list page when register locations are confirmed", async () => {
    const response = await request(app)
      .post(REGISTER_LOCATIONS_URL)
      .send({ registers: RADIO_BUTTON_VALUE.YES });

    expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.REGISTER_LOCATIONS);
    expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should redirect to task list when recently filed radio button is selected", async () => {
    const response = await request(app)
      .post(REGISTER_LOCATIONS_URL)
      .send({ registers: RADIO_BUTTON_VALUE.RECENTLY_FILED });
    expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.REGISTER_LOCATIONS);
    expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.CONFIRMED);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(TASK_LIST_URL);
  });

  it("Should navigate to the register locations stop page if details are incorrect", async () => {
    const response = await request(app)
      .post(REGISTER_LOCATIONS_URL)
      .send({ registers: RADIO_BUTTON_VALUE.NO });
    expect(mockSendUpdate.mock.calls[0][1]).toBe(SECTIONS.REGISTER_LOCATIONS);
    expect(mockSendUpdate.mock.calls[0][2]).toBe(SectionStatus.NOT_CONFIRMED);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(WRONG_REGISTER_LOCATIONS_URL);
  });

  it("Should display error message on register locations page when radio button is not selected", async () => {
    mockGetRegisterLocation.mockResolvedValueOnce(mockRegisterLocation);
    const response = await request(app).post(REGISTER_LOCATIONS_URL);

    expect(response.status).toEqual(200);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(REGISTER_LOCATIONS_ERROR);
  });

  it("Should return error page when radio button id is not valid", async () => {
    const response = await request(app)
      .post(REGISTER_LOCATIONS_URL)
      .send({ registers: "malicious code block" });

    expect(response.status).toEqual(500);
    expect(response.text).toContain(EXPECTED_ERROR_TEXT);
  });

  it("Should return an error page if error is thrown in post function", async () => {
    const spyGetUrlWithCompanyNumber = jest.spyOn(urlUtils, "getUrlToPath");
    spyGetUrlWithCompanyNumber.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).post(REGISTER_LOCATIONS_URL);

    expect(response.text).toContain(EXPECTED_ERROR_TEXT);

    // restore original function so it is no longer mocked
    spyGetUrlWithCompanyNumber.mockRestore();
  });

});
