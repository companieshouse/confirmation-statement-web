jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/utils/logger");

import mocks from "../mocks/all.middleware.mock";
import { TASK_LIST_PATH } from "../../src/types/page.urls";
import request from "supertest";
import app from "../../src/app";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { toReadableFormat } from "../../src/utils/date";
import { DateTime } from "luxon";
import { createAndLogError } from "../../src/utils/logger";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

const COMPANY_NUMBER = "12345678";


describe("Task list controller tests", () => {

  it("Should navigate to the task list page", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain("You will need to check and confirm that the company information we have on record is correct");
  });

  it("Should show recordDate as next due date when filing after nextMadeUpToDate", async () => {
    if (validCompanyProfile.confirmationStatement === undefined) {
      fail;
    } else {
      const expectedDate = toReadableFormat(validCompanyProfile.confirmationStatement.nextMadeUpTo);
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mocks.mockAuthenticationMiddleware.mockClear();
      const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
      const response = await request(app).get(url);
      expect(response.text).toContain(expectedDate);
    }
  });

  it("Should show recordDate as nextMadeUpTo date when filing on the nextMadeUpToDate", async () => {
    if (validCompanyProfile.confirmationStatement === undefined) {
      fail;
    } else {
      validCompanyProfile.confirmationStatement.nextMadeUpTo = DateTime.now().toString();
      const expectedDate = toReadableFormat(validCompanyProfile.confirmationStatement.nextMadeUpTo);
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mocks.mockAuthenticationMiddleware.mockClear();
      const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
      const response = await request(app).get(url);
      expect(response.text).toContain(expectedDate);
    }
  });

  it("Should show recordDate as sysdate when filing before the nextMadeUpToDate", async () => {
    if (validCompanyProfile.confirmationStatement === undefined) {
      fail;
    } else {
      validCompanyProfile.confirmationStatement.nextMadeUpTo = DateTime.fromISO('2999-06-04T00:00:00.000Z').toString();
      const expectedDate = toReadableFormat(DateTime.now().toString());
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mocks.mockAuthenticationMiddleware.mockClear();
      const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
      const response = await request(app).get(url);
      expect(response.text).toContain(expectedDate);
    }
  });

  it("Should show throw an error when confirmationStatent is missing", async () => {
    validCompanyProfile.confirmationStatement = undefined;
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mocks.mockAuthenticationMiddleware.mockClear();
    const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should return an error page if error is thrown when Company Profile is missing confirmation statement", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const url = TASK_LIST_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app).get(url);
    expect(mockCreateAndLogError).toBeCalledWith("Company Profile is missing confirmationStatement info for company number: 12345678");
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

});
