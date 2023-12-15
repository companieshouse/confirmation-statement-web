jest.mock("../../src/utils/date");
jest.mock("../../src/utils/url");
jest.mock("../../src/utils/feature.flag");

import { ConfirmationStatementSubmission, ConfirmationStatementSubmissionData } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { initTaskList } from "../../src/services/task.list.service";
import {
  ACTIVE_OFFICERS_PATH,
  PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  REGISTER_LOCATIONS_PATH,
  SHAREHOLDERS_PATH,
  SIC_PATH,
  STATEMENT_OF_CAPITAL_PATH,
  ACTIVE_PSC_DETAILS_PATH,
  PROVIDE_EMAIL_ADDRESS_PATH,
  CHECK_EMAIL_ADDRESS_PATH
} from "../../src/types/page.urls";
import { TaskList, TaskState } from "../../src/types/task.list";
import { toReadableFormat } from "../../src/utils/date";
import { urlUtils } from "../../src/utils/url";
import { mockConfirmationStatementSubmission, mockConfirmationStatementSubmissionAllConfirmed, mockConfirmationStatementSubmissionMixedStatuses } from "../mocks/confirmation.statement.submission.mock";
import { isActiveFeature } from "../../src/utils/feature.flag";

const COMPANY_NUMBER = "1242222";
const TRANSACTION_ID = "4646464";
const CS_SUBMISSION_ID = "474747";
const TASK_COMPLETED_COUNT = 1;
const ALL_TASK_COMPLETED_COUNT = 8;
const RECORD_DATE = "10 Jun 2021";
const TASK_URL = "/something/something";

const mockToReadableFormat = toReadableFormat as jest.Mock;
mockToReadableFormat.mockReturnValue(RECORD_DATE);

const mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId as jest.Mock;
mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mockReturnValue(TASK_URL);

const mockGetUrlWithCompanyNumber = urlUtils.getUrlWithCompanyNumber as jest.Mock;
mockGetUrlWithCompanyNumber.mockReturnValue(TASK_URL);

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("Task List Service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initTaskList tests", () => {
    it("Should return a populated task list", () => {
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission, true, true);
      expect(taskList.tasks.officers.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.officers.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[0][0]).toBe(ACTIVE_OFFICERS_PATH);

      expect(taskList.tasks.peopleSignificantControl.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.peopleSignificantControl.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[1][0]).toBe(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH);

      expect(taskList.tasks.registerLocations.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.registerLocations.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[2][0]).toBe(REGISTER_LOCATIONS_PATH);

      expect(taskList.tasks.registeredEmailAddress?.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.registeredEmailAddress?.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[3][0]).toBe(CHECK_EMAIL_ADDRESS_PATH);

      expect(taskList.tasks.registeredOfficeAddress.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.registeredOfficeAddress.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[4][0]).toBe(REGISTERED_OFFICE_ADDRESS_PATH);

      expect(taskList.tasks.shareholders.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.shareholders.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[5][0]).toBe(SHAREHOLDERS_PATH);

      expect(taskList.tasks.sicCodes.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.sicCodes.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[6][0]).toBe(SIC_PATH);

      expect(taskList.tasks.statementOfCapital.state).toBe(TaskState.CHECKED);
      expect(taskList.tasks.statementOfCapital.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[7][0]).toBe(STATEMENT_OF_CAPITAL_PATH);

      expect(taskList.recordDate).toBe(RECORD_DATE);
      expect(taskList.tasksCompletedCount).toBe(TASK_COMPLETED_COUNT);
      expect(taskList.allTasksCompleted).toBe(false);
      expect(taskList.csDue).toBe(false);
    });

    it("Should populate soc state if data is undefined", () => {
      const clonedSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      clonedSubmission.data = undefined as unknown as ConfirmationStatementSubmissionData;
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, clone(clonedSubmission), true, true);
      expect(taskList.tasks.statementOfCapital.state).toBe(TaskState.NOT_CHECKED);
    });

    it("Should populate soc state if soc data is missing", () => {
      const clonedSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      clonedSubmission.data = {
        confirmationStatementMadeUpToDate: "2021-03-11"
      };
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, clone(clonedSubmission), true, true);
      expect(taskList.tasks.statementOfCapital.state).toBe(TaskState.NOT_CHECKED);
    });

    it("Should populate set all tasks completed to TRUE.", () => {
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmissionAllConfirmed, true, true);

      expect(taskList.tasksCompletedCount).toBe(ALL_TASK_COMPLETED_COUNT);
      expect(taskList.allTasksCompleted).toBe(true);
    });

    it("Should return single psc page when five or more feature flag is false", () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission, true, true);
      expect(taskList.tasks.peopleSignificantControl.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.peopleSignificantControl.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[1][0]).toBe(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH);
    });

    it("Should return multiple psc page when five or more feature flag is true", () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission, true, true);
      expect(taskList.tasks.peopleSignificantControl.state).toBe(TaskState.NOT_CHECKED);
      expect(taskList.tasks.peopleSignificantControl.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[1][0]).toBe(ACTIVE_PSC_DETAILS_PATH);
    });

    it("Should use provide-email-address for Registered email address option when company does not have an existing email address", () => {
      initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission, true, false);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[3][0]).toBe(PROVIDE_EMAIL_ADDRESS_PATH);
    });

    it("Should use check-email-address for Registered email address option when company has an existing email address", () => {
      initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission, true, true);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[3][0]).toBe(CHECK_EMAIL_ADDRESS_PATH);
    });

    it("Should have an expected task count of 7 and correct completed count when rea feature is not active", () => {
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmissionMixedStatuses, false, true);
      expect(taskList.tasks.registeredEmailAddress).toBeUndefined();
      expect(taskList.tasks.registeredEmailAddress).toBeUndefined();
      expect(taskList.tasksCompletedCount).toBe(5);
      expect(taskList.tasksExpectedCount).toBe(7);
    });

    it("Should have an expected task count of 8 and correct completed count when rea feature is active", () => {
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmissionMixedStatuses, true, true);
      expect(taskList.tasks.registeredEmailAddress?.state).toBe(TaskState.CHECKED);
      expect(taskList.tasks.registeredEmailAddress?.url).toBe(TASK_URL);
      expect(taskList.tasksCompletedCount).toBe(6);
      expect(taskList.tasksExpectedCount).toBe(8);
    });
  });
});

const clone = (obj: any): any => JSON.parse(JSON.stringify(obj));
