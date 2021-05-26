jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/eligibility.service");
jest.mock("../../src/services/confirmation.statement.service");
jest.mock("../../src/utils/feature.flag");

import { checkEligibility } from "../../src/services/eligibility.service";
import { createConfirmationStatement } from "../../src/services/confirmation.statement.service";
import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { EligibilityStatusCode } from "private-api-sdk-node/dist/services/confirmation-statement";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockCreateConfirmationStatement = createConfirmationStatement as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockEligibilityStatusCode = checkEligibility as jest.Mock;

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";

  beforeEach(() => {
    jest.clearAllMocks();
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

  it("Should return error page if error is thrown when getting Company Profile", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should call private sdk client", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockCreateConfirmationStatement.mockResolvedValueOnce(201);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
    await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(mockCreateConfirmationStatement).toHaveBeenCalled();
  });

  it("Should not call private sdk client id feature flag is off", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
    await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
  });


  it("Should render error page when company status is not valid", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_STATUS);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("dissolved and struck off the register");
  });


});
