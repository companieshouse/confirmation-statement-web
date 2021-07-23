jest.mock("../../src/services/task.list.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/utils/logger");
jest.mock("../../src/services/confirmation.statement.service");

import mocks from "../mocks/all.middleware.mock";
import { TASK_LIST_PATH, urlParams } from "../../src/types/page.urls";
import request from "supertest";
import app from "../../src/app";
import { initTaskList } from "../../src/services/task.list.service";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { toReadableFormat } from "../../src/utils/date";
import { DateTime } from "luxon";
import { createAndLogError } from "../../src/utils/logger";
import { getConfirmationStatement } from "../../src/services/confirmation.statement.service";
import { mockConfirmationStatementSubmission } from "../mocks/confirmation.statement.submission.mock";
import { mockTaskList } from "../mocks/task.list.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
mockGetConfirmationStatement.mockResolvedValue(mockConfirmationStatementSubmission);

const mockInitTaskList = initTaskList as jest.Mock;
mockInitTaskList.mockReturnValue(mockTaskList);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = TASK_LIST_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);


describe("Task list controller tests", () => {

  it("Should navigate to the task list page", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mocks.mockAuthenticationMiddleware.mockClear();

    const response = await request(app).get(URL);

    expect(mockInitTaskList).toBeCalledWith(validCompanyProfile.companyNumber, TRANSACTION_ID, SUBMISSION_ID, mockConfirmationStatementSubmission);
    expect(response.text).toContain("You will need to check and confirm that the company information we have on record is correct");
  });

  it("Should show recordDate as next due date when filing after nextMadeUpToDate", async () => {
    if (validCompanyProfile.confirmationStatement === undefined) {
      fail();
    } else {
      const expectedDate = toReadableFormat(validCompanyProfile.confirmationStatement.nextMadeUpTo);
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mocks.mockAuthenticationMiddleware.mockClear();
      const response = await request(app).get(URL);
      expect(response.text).toContain(expectedDate);
    }
  });

  it("Should show recordDate as nextMadeUpTo date when filing on the nextMadeUpToDate", async () => {
    if (validCompanyProfile.confirmationStatement === undefined) {
      fail();
    } else {
      validCompanyProfile.confirmationStatement.nextMadeUpTo = DateTime.now().toString();
      const expectedDate = toReadableFormat(validCompanyProfile.confirmationStatement.nextMadeUpTo);
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mocks.mockAuthenticationMiddleware.mockClear();
      const response = await request(app).get(URL);

      expect(response.text).toContain(expectedDate);
    }
  });

  it("Should show recordDate as sysdate when filing before the nextMadeUpToDate", async () => {
    if (validCompanyProfile.confirmationStatement === undefined) {
      fail();
    } else {
      validCompanyProfile.confirmationStatement.nextMadeUpTo = DateTime.fromISO('2999-06-04T00:00:00.000Z').toString();
      const expectedDate = toReadableFormat(DateTime.now().toString());
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mocks.mockAuthenticationMiddleware.mockClear();
      const response = await request(app).get(URL);

      expect(response.text).toContain(expectedDate);
    }
  });

  it("Should throw an error when confirmationStatent is missing", async () => {
    validCompanyProfile.confirmationStatement = undefined;
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mocks.mockAuthenticationMiddleware.mockClear();
    const response = await request(app).get(URL);

    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should return an error page if error is thrown when Company Profile is missing confirmation statement", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const response = await request(app).get(URL);

    expect(mockCreateAndLogError).toBeCalledWith("Company Profile is missing confirmationStatement info for company number: 12345678");
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

});
