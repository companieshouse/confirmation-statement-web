jest.mock("../../src/services/task.list.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/utils/logger");
jest.mock("../../src/services/confirmation.statement.service");
jest.mock("../../src/services/registered.email.address.service");

import mocks from "../mocks/all.middleware.mock";
import { REVIEW_PATH, TASK_LIST_PATH, urlParams } from "../../src/types/page.urls";
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
import { mockTaskListWithEmail, mockTaskListNoEmail } from "../mocks/task.list.mock";
import { urlUtils } from "../../src/utils/url";
import { doesCompanyHaveEmailAddress } from "../../src/services/registered.email.address.service";

const PropertiesMock = jest.requireMock('../../src/utils/properties');
jest.mock('../../src/utils/properties', () => ({
  ...jest.requireActual('../../src/utils/properties'),
}));

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
mockGetConfirmationStatement.mockResolvedValue(mockConfirmationStatementSubmission);

const mockInitTaskList = initTaskList as jest.Mock;
mockInitTaskList.mockReturnValue(mockTaskListNoEmail);

const mockDoesCompanyHaveEmailAddress = doesCompanyHaveEmailAddress as jest.Mock;
mockDoesCompanyHaveEmailAddress.mockReturnValue(true);

const ERROR_TEXT = "Sorry, there is a problem with the service";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = TASK_LIST_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Task list controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.mockAuthenticationMiddleware.mockClear();
  });

  describe("get tests", () => {
    it("Should navigate to the task list page", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

      const response = await request(app).get(URL);

      expect(mockInitTaskList).toBeCalledWith(validCompanyProfile.companyNumber, TRANSACTION_ID, SUBMISSION_ID, mockConfirmationStatementSubmission, false, true);
      expect(response.text).toContain("Check and confirm that the company information we have on record is correct");
      expect(response.text).toContain("Submit");
      expect(response.text).toContain("Cannot start yet");
      expect(response.text).not.toContain("Registered email address");
    });

    it("Should show recordDate as next due date when filing after nextMadeUpToDate", async () => {
      if (validCompanyProfile.confirmationStatement === undefined) {
        fail();
      } else {
        const expectedDate = toReadableFormat(validCompanyProfile.confirmationStatement.nextMadeUpTo);
        mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
        const response = await request(app).get(URL);
        expect(response.text).toContain(expectedDate);
        expect(response.text).not.toContain("Registered email address");
      }
    });

    it("Should show recordDate as nextMadeUpTo date when filing on the nextMadeUpToDate", async () => {
      if (validCompanyProfile.confirmationStatement === undefined) {
        fail();
      } else {
        const companyProfile = clone(validCompanyProfile);
        companyProfile.confirmationStatement.nextMadeUpTo = DateTime.now().toString();
        const expectedDate = toReadableFormat(companyProfile.confirmationStatement.nextMadeUpTo);
        mockGetCompanyProfile.mockResolvedValueOnce(companyProfile);
        const response = await request(app).get(URL);

        expect(response.text).toContain(expectedDate);
        expect(response.text).not.toContain("Registered email address");
      }
    });

    it("Should show recordDate as sysdate when filing before the nextMadeUpToDate", async () => {
      if (validCompanyProfile.confirmationStatement === undefined) {
        fail();
      } else {
        const companyProfile = clone(validCompanyProfile);
        companyProfile.confirmationStatement.nextMadeUpTo = DateTime.fromISO('2999-06-04T00:00:00.000Z').toString();
        const expectedDate = toReadableFormat(DateTime.now().toString());
        mockGetCompanyProfile.mockResolvedValueOnce(companyProfile);

        const response = await request(app).get(URL);

        expect(response.text).toContain(expectedDate);
        expect(response.text).not.toContain("Registered email address");
      }
    });

    it("Should throw an error when confirmationStatement is missing", async () => {
      const companyProfile = clone(validCompanyProfile);
      companyProfile.confirmationStatement = undefined;
      mockGetCompanyProfile.mockResolvedValueOnce(companyProfile);
      const response = await request(app).get(URL);

      expect(response.text).toContain(ERROR_TEXT);
    });

    it("Should return an error page if error is thrown when Company Profile is missing confirmation statement", async () => {
      const message = "Can't connect";
      mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
      const response = await request(app).get(URL);

      expect(response.status).toBe(500);
      expect(response.text).toContain(ERROR_TEXT);
      expect(response.text).not.toContain("Registered email address");
    });

    it("Should enable Registered email address option when confirmation statement date is the same as ECCT start date", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockInitTaskList.mockReturnValueOnce(mockTaskListWithEmail);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-03-15";
      const response = await request(app).get(URL);

      expect(mockInitTaskList).toBeCalledWith(validCompanyProfile.companyNumber, TRANSACTION_ID, SUBMISSION_ID, mockConfirmationStatementSubmission, true, true);
      expect(response.text).toContain("Registered email address");
    });

    it("Should enable Registered email address option when confirmation statement date is after ECCT start date", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockInitTaskList.mockReturnValueOnce(mockTaskListWithEmail);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-03-14";
      const response = await request(app).get(URL);

      expect(mockInitTaskList).toBeCalledWith(validCompanyProfile.companyNumber, TRANSACTION_ID, SUBMISSION_ID, mockConfirmationStatementSubmission, true, true);
      expect(response.text).toContain("Registered email address");
    });

    it("Should disable Registered email address option when confirmation statement date is before ECCT start date", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockInitTaskList.mockReturnValueOnce(mockTaskListNoEmail);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = '2020-03-16';
      const response = await request(app).get(URL);

      expect(mockInitTaskList).toBeCalledWith(validCompanyProfile.companyNumber, TRANSACTION_ID, SUBMISSION_ID, mockConfirmationStatementSubmission, false, true);
      expect(response.text).not.toContain("Registered email address");
    });

    it("Should disable Registered email address option when ECCT Feature flag environment variable is invalid format", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockInitTaskList.mockReturnValueOnce(mockTaskListNoEmail);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = '2020-03-99';
      const response = await request(app).get(URL);
      expect(mockInitTaskList).toBeCalledWith(validCompanyProfile.companyNumber, TRANSACTION_ID, SUBMISSION_ID, mockConfirmationStatementSubmission, false, true);
      expect(response.text).not.toContain("Registered email address");
    });

    it("Should disable Registered email address option when ECCT Feature flag environment variable not supplied", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockInitTaskList.mockReturnValueOnce(mockTaskListNoEmail);
      const response = await request(app).get(URL);

      expect(mockInitTaskList).toBeCalledWith(validCompanyProfile.companyNumber, TRANSACTION_ID, SUBMISSION_ID, mockConfirmationStatementSubmission, false, true);
      expect(response.text).not.toContain("Registered email address");
    });
  });

  describe("post tests", () => {
    it("Should redirect to the review page", async () => {

      const EXPECTED_REVIEW_PATH = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
        REVIEW_PATH,
        COMPANY_NUMBER,
        TRANSACTION_ID,
        SUBMISSION_ID );

      const response = await request(app).post(URL);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(EXPECTED_REVIEW_PATH);
    });

    it("Should navigate to an error page if an error occurs", async () => {
      const spyGetUrl = jest.spyOn(urlUtils, "getUrlWithCompanyNumberTransactionIdAndSubmissionId");
      spyGetUrl.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).post(URL);

      expect(response.text).toContain(ERROR_TEXT);

      spyGetUrl.mockRestore();
    });
  });
});
