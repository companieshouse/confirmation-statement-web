jest.mock("../../src/utils/task/task.counter");
jest.mock("../../src/utils/date");
jest.mock("../../src/utils/task/task.state.mapper");
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
  ACTIVE_PSC_DETAILS_PATH
} from "../../src/types/page.urls";
import { TaskList, TaskState } from "../../src/types/task.list";
import { toReadableFormat } from "../../src/utils/date";
import { getTaskCompletedCount } from "../../src/utils/task/task.counter";
import { toTaskState } from "../../src/utils/task/task.state.mapper";
import { urlUtils } from "../../src/utils/url";
import { mockConfirmationStatementSubmission } from "../mocks/confirmation.statement.submission.mock";
import { isActiveFeature } from "../../src/utils/feature.flag";

const COMPANY_NUMBER = "1242222";
const TRANSACTION_ID = "4646464";
const CS_SUBMISSION_ID = "474747";
const TASK_COMPLETED_COUNT = 3;
const RECORD_DATE = "10 Jun 2021";
const TASK_STATE: TaskState = TaskState.CHECKED;
const TASK_URL = "/something/something";

const mockGetTaskCompletedCount = getTaskCompletedCount as jest.Mock;
mockGetTaskCompletedCount.mockReturnValue(TASK_COMPLETED_COUNT);

const mockToReadableFormat = toReadableFormat as jest.Mock;
mockToReadableFormat.mockReturnValue(RECORD_DATE);

const mockToTaskState = toTaskState as jest.Mock;
mockToTaskState.mockReturnValue(TASK_STATE);

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
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission);

      expect(taskList.tasks.officers.state).toBe(TASK_STATE);
      expect(taskList.tasks.officers.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[0][0]).toBe(ACTIVE_OFFICERS_PATH);

      expect(taskList.tasks.peopleSignificantControl.state).toBe(TaskState.CHECKED);
      expect(taskList.tasks.peopleSignificantControl.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[1][0]).toBe(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH);

      expect(taskList.tasks.registerLocations.state).toBe(TASK_STATE);
      expect(taskList.tasks.registerLocations.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[2][0]).toBe(REGISTER_LOCATIONS_PATH);

      expect(taskList.tasks.registeredOfficeAddress.state).toBe(TASK_STATE);
      expect(taskList.tasks.registeredOfficeAddress.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[3][0]).toBe(REGISTERED_OFFICE_ADDRESS_PATH);

      expect(taskList.tasks.shareholders.state).toBe(TaskState.CHECKED);
      expect(taskList.tasks.shareholders.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[4][0]).toBe(SHAREHOLDERS_PATH);

      expect(taskList.tasks.sicCodes.state).toBe(TaskState.CHECKED);
      expect(taskList.tasks.sicCodes.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[5][0]).toBe(SIC_PATH);

      expect(taskList.tasks.statementOfCapital.state).toBe(TASK_STATE);
      expect(taskList.tasks.statementOfCapital.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[6][0]).toBe(STATEMENT_OF_CAPITAL_PATH);

      expect(taskList.recordDate).toBe(RECORD_DATE);
      expect(taskList.tasksCompletedCount).toBe(TASK_COMPLETED_COUNT);
      expect(taskList.allTasksCompleted).toBe(false);
      expect(taskList.csDue).toBe(false);
    });

    it("Should populate soc state if data is undefined", () => {
      const clonedSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      clonedSubmission.data = undefined as unknown as ConfirmationStatementSubmissionData;
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, clone(clonedSubmission));
      expect(taskList.tasks.statementOfCapital.state).toBe(TASK_STATE);
    });

    it("Should populate soc state if soc data is missing", () => {
      const clonedSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      clonedSubmission.data = {
        confirmationStatementMadeUpToDate: "2021-03-11"
      };
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, clone(clonedSubmission));
      expect(taskList.tasks.statementOfCapital.state).toBe(TASK_STATE);
    });

    it("Should populate set all tasks completed to TRUE.", () => {
      const ALL_TASK_COMPLETED_COUNT = 7;
      mockGetTaskCompletedCount.mockReturnValueOnce(ALL_TASK_COMPLETED_COUNT);
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission);

      expect(taskList.tasksCompletedCount).toBe(ALL_TASK_COMPLETED_COUNT);
      expect(taskList.allTasksCompleted).toBe(true);
    });

    it("Should return single psc page when five or more feature flag is false", () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission);
      expect(taskList.tasks.peopleSignificantControl.state).toBe(TaskState.CHECKED);
      expect(taskList.tasks.peopleSignificantControl.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[1][0]).toBe(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH);
    });

    it("Should return multiple psc page when five or more feature flag is true", () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const taskList: TaskList = initTaskList(COMPANY_NUMBER, TRANSACTION_ID, CS_SUBMISSION_ID, mockConfirmationStatementSubmission);
      expect(taskList.tasks.peopleSignificantControl.state).toBe(TaskState.CHECKED);
      expect(taskList.tasks.peopleSignificantControl.url).toBe(TASK_URL);
      expect(mockGetUrlWithCompanyNumberTransactionIdAndSubmissionId.mock.calls[1][0]).toBe(ACTIVE_PSC_DETAILS_PATH);
    });
  });
});

const clone = (obj: any): any => JSON.parse(JSON.stringify(obj));
