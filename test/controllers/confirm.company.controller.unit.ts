jest.mock("ioredis");
jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";

  beforeEach(() => {
    mockGetCompanyProfile.mockClear();
  });

  it("Should navigate to confirm company page", async () => {
    const companyNumber = "123456";

    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH)
      .query({ companyNumber });

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(companyNumber);
    expect(response.text).toContain(PAGE_HEADING);
    expect(mocks.mockServiceAvailabilityMiddleware).toHaveBeenCalled();
  });
});
