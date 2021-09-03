jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/register.location.service");

import request from "supertest";
import mocks from "../../mocks/all.middleware.mock";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import { REGISTER_LOCATIONS_PATH, urlParams } from "../../../src/types/page.urls";
import { urlUtils } from "../../../src/utils/url";
import { getRegisterLocationData } from "../../../src/services/register.location.service";
import { mockRegisterLocation, mockRegisterLocationNoReg, mockRegisterLocationNoRegNoSail } from "../../mocks/register.location.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetRegisterLocation = getRegisterLocationData as jest.Mock;

const PAGE_HEADING = "Review where the company records are held";
const SAIL_HEADING = "SAIL (Single Alternative Inspection Location)";
const NO_RECORDS_SAIL = "There are currently no records held at the SAIL addres";
const ALL_RECORDS_MESSAGE = "All company records are kept at the registered office address or on the public record.";
const OTHER_RECORDS_MESSAGE = "Any other company records are kept at the registered office address, or on the public record.";

const COMPANY_NUMBER = "12345678";
const REGISTER_LOCATIONS_URL = REGISTER_LOCATIONS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Register locations controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetRegisterLocation.mockClear();
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

    expect(response.text).toContain("Sorry, the service is unavailable");

    // restore original function so it is no longer mocked
    spyGetUrlToPath.mockRestore();
  });

});
