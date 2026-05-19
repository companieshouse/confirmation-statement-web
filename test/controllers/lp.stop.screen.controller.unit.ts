jest.mock("../../src/utils/session");

import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfileFromSession } from "../../src/utils/session";
import { validLimitedPartnershipProfile } from "../mocks/company.profile.mock";
import { LP_STOP_SCREEN_PATH } from "../../src/types/page.urls";

const mockGetCompanyProfileFromSession = getCompanyProfileFromSession as jest.Mock;

const STOP_PAGE_TITLE = "You cannot file a confirmation statement";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with the service";

describe("LP stop screen controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompanyProfileFromSession.mockReturnValue(validLimitedPartnershipProfile);
  });

  it("Should render the LP invalid company status stop page", async () => {
    const response = await request(app).get(LP_STOP_SCREEN_PATH);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain(STOP_PAGE_TITLE);
    expect(response.text).toContain(validLimitedPartnershipProfile.companyName);
  });

  it("Should return error page if no company in session", async () => {
    mockGetCompanyProfileFromSession.mockReturnValueOnce(undefined);
    const response = await request(app).get(LP_STOP_SCREEN_PATH);

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
  });

});
