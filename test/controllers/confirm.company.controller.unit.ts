jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/eligibility.service");
jest.mock("../../src/services/confirmation.statement.service");
jest.mock("../../src/utils/feature.flag");
jest.mock("../../src/utils/date");

import { EligibilityStatusCode, NextMadeUpToDate } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { checkEligibility } from "../../src/services/eligibility.service";
import { createConfirmationStatement, getNextMadeUpToDate } from "../../src/services/confirmation.statement.service";
import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";
import { getCompanyProfile, formatForDisplay } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { toReadableFormat } from "../../src/utils/date";
import { Settings as luxonSettings } from "luxon";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockFormatForDisplay = formatForDisplay as jest.Mock;
const mockCreateConfirmationStatement = createConfirmationStatement as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockEligibilityStatusCode = checkEligibility as jest.Mock;
const mockToReadableFormat = toReadableFormat as jest.Mock;
const mockGetNextMadeUpToDate = getNextMadeUpToDate as jest.Mock;

const companyNumber = "12345678";
const today = "2020-04-25";

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";

  beforeEach(() => {
    jest.clearAllMocks();
    mockEligibilityStatusCode.mockReset();
    luxonSettings.now = () => new Date(today).valueOf();
  });

  it("Should navigate to confirm company page", async () => {
    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain(PAGE_HEADING);
    expect(mocks.mockServiceAvailabilityMiddleware).toHaveBeenCalled();
  });

  it("Should pass the company number to the company profile service", async () => {
    await request(app)
      .get(CONFIRM_COMPANY_PATH)
      .query({ companyNumber });

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(companyNumber);
  });

  it("Should populate the template with CompanyProfile data", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockFormatForDisplay.mockReturnValueOnce(validCompanyProfile);
    mockGetNextMadeUpToDate.mockResolvedValueOnce({
      currentNextMadeUpToDate: validCompanyProfile.confirmationStatement?.nextMadeUpTo,
      isDue: false,
      newNextMadeUpToDate: today
    } as NextMadeUpToDate);

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

  it("Should call private sdk client and redirect to transaction using company number in profile retrieved from database", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockCreateConfirmationStatement.mockResolvedValueOnce(201);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/confirmation-statement/company/" + companyNumber + "/transaction");
    expect(mockCreateConfirmationStatement).toHaveBeenCalled();
  });

  it("Should not call private sdk client id feature flag is off", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(302);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
  });

  it("Should render eligibility error page when company status is not valid", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_STATUS);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("dissolved and struck off the register");
    expect(response.text).toContain(`cannot be filed for ${validCompanyProfile.companyName}`);
  });

  it("Should redirect to error page when unrecognised eligibility code is returned", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockEligibilityStatusCode.mockResolvedValueOnce("abcdefg");
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(500);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should redirect to error page when promise fails", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockEligibilityStatusCode.mockRejectedValueOnce(new Error());
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(500);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should redirect to error page when the eligibility status code is undefined", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockEligibilityStatusCode.mockResolvedValueOnce(undefined);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(500);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should redirect to use webfiling stop screen when the eligibility status code is INVALID_TYPE_USE_WEBFILING", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_TYPE_USE_WEB_FILING);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("You cannot use this service - File a confirmation statement");
  });

  it("Should redirect to use webfiling stop screen when the eligibility status code is INVALID_COMPANY_TRADED_STATUS_USE_WEBFILING", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_TRADED_STATUS_USE_WEBFILING);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("You cannot use this service - File a confirmation statement");
  });

  it("Should redirect to use paper stop screen when the eligibility status code is INVALID_COMPANY_TYPE_PAPER_FILING_ONLY", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_TYPE_PAPER_FILING_ONLY);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("You cannot use this service - File a confirmation statement");
    expect(response.text).toContain("https://www.gov.uk/government/publications/confirmation-statement-cs01");
  });

  it("Should redirect to use paper stop screen when the eligibility status code is INVALID_COMPANY_TYPE_PAPER_FILING_ONLY, type scottish-partnership", async () => {
    const originalType = validCompanyProfile.type;
    validCompanyProfile.type  = "scottish-partnership";
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_TYPE_PAPER_FILING_ONLY);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    validCompanyProfile.type  = originalType;
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("You cannot use this service - File a confirmation statement");
    expect(response.text).toContain("https://www.gov.uk/government/publications/confirmation-statement-for-a-scottish-qualifying-partnership-sqp-cs01");
  });

  it("Should redirect to use paper stop screen when the eligibility status code is INVALID_COMPANY_TYPE_PAPER_FILING_ONLY, type limited-partnership", async () => {
    const originalType = validCompanyProfile.type;
    validCompanyProfile.type  = "limited-partnership";
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_TYPE_PAPER_FILING_ONLY);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    validCompanyProfile.type  = originalType;
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("You cannot use this service - File a confirmation statement");
    expect(response.text).toContain("https://www.gov.uk/government/publications/confirmation-statement-for-a-scottish-limited-partnership-slp-cs01");
  });

  it("Should redirect to use no filing required stop screen when the eligibility status code is INVALID_COMPANY_TYPE_CS01_FILING_NOT_REQUIRED", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_TYPE_CS01_FILING_NOT_REQUIRED);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("which means it is not required to file confirmation statements.");
  });

  it("Should redirect to use webfiling stop screen when the eligibility status code is INVALID_COMPANY_APPOINTMENTS_INVALID_NUMBER_OF_OFFICERS", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_APPOINTMENTS_INVALID_NUMBER_OF_OFFICERS);
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("You cannot use this service - File a confirmation statement");
  });

  it("Should redirect to use webfiling stop screen when the eligibility status code is INVALID_COMPANY_APPOINTMENTS_MORE_THAN_ONE_SHAREHOLDER", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockEligibilityStatusCode.mockResolvedValueOnce(EligibilityStatusCode.INVALID_COMPANY_APPOINTMENTS_MORE_THAN_ONE_SHAREHOLDER);
    const response = await request(app).post(CONFIRM_COMPANY_PATH);
    expect(response.status).toEqual(200);
    expect(mockCreateConfirmationStatement).not.toHaveBeenCalled();
    expect(response.text).toContain("You cannot use this service - File a confirmation statement");
  });

  it("Should display a warning if filing is not due", async () => {
    const formattedToday = "25 April 2020";
    const formattedNextMadeUpTo = "15 March 2020";

    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockGetNextMadeUpToDate.mockResolvedValueOnce({
      currentNextMadeUpToDate: validCompanyProfile.confirmationStatement?.nextMadeUpTo,
      isDue: false,
      newNextMadeUpToDate: today
    } as NextMadeUpToDate);
    mockFormatForDisplay.mockReturnValueOnce({
      confirmationStatement:
        { nextMadeUpTo: formattedNextMadeUpTo }
    });

    mockToReadableFormat
      .mockReturnValueOnce(formattedToday)
      .mockReturnValueOnce(formattedNextMadeUpTo);

    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain("You are not due to file a confirmation statement");
    expect(response.text).toContain(formattedToday);
    expect(response.text).toContain(formattedNextMadeUpTo);
  });

  it("Should not display a warning if filing is due", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockGetNextMadeUpToDate.mockResolvedValueOnce({
      currentNextMadeUpToDate: validCompanyProfile.confirmationStatement?.nextMadeUpTo,
      isDue: true
    } as NextMadeUpToDate);
    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).not.toContain("You are not due to file a confirmation statement");
  });

  it("Should not convert next made up to date to readable format if date not found", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockGetNextMadeUpToDate.mockResolvedValueOnce({
      currentNextMadeUpToDate: validCompanyProfile.confirmationStatement?.nextMadeUpTo,
      isDue: false
    } as NextMadeUpToDate);

    await request(app).get(CONFIRM_COMPANY_PATH);

    expect(mockToReadableFormat).not.toBeCalled();
  });
});
