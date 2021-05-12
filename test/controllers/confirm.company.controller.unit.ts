jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/confirmation.statement.service");

import { createConfirmationStatement } from "../../src/services/confirmation.statement.service";
import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockCreateConfirmationStatement = createConfirmationStatement as jest.Mock;

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";

  beforeEach(() => {
    mockGetCompanyProfile.mockClear();
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockServiceAvailabilityMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
  });

  it("Should navigate to confirm company page", async () => {
    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain(PAGE_HEADING);
    expect(mocks.mockServiceAvailabilityMiddleware).toHaveBeenCalled();
  });

  it("Should pass the company number to the company profile service", async () => {
    const companyNumber = "123456";

    await request(app)
      .get(CONFIRM_COMPANY_PATH)
      .query({ companyNumber });

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(companyNumber);
  });

  it("Should populate the template with CompanyProfile data", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain(validCompanyProfile.companyNumber);
    expect(response.text).toContain(validCompanyProfile.companyName);
  });

  it("Should call private sdk client", async () => {
    mockCreateConfirmationStatement.mockResolvedValueOnce(201);
    await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(mockCreateConfirmationStatement).toHaveBeenCalled();
  });

});
