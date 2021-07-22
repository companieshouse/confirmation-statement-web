import { DateTime } from "luxon";
import { toReadableFormat } from "../utils/date";
import {
  ACTIVE_PSCS_PATH,
  SIC_PATH,
  STATEMENT_OF_CAPITAL_PATH,
  ACTIVE_OFFICERS_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH
  , SHAREHOLDERS_PATH } from "./page.urls";
import { urlUtils } from "../utils/url";
import { ConfirmationStatementSubmission, ConfirmationStatementSubmissionData, SectionStatus } from "private-api-sdk-node/dist/services/confirmation-statement";

export enum TaskState {
    NOT_CHECKED = "NOT_CHECKED",
    IN_PROGRESS = "IN_PROGRESS",
    CHECKED = "CHECKED"
}

export enum TradingStatus {
   NOT_ADMITTED = "NOT_ADMITTED",
   ADMITTED = "ADMITTED",
   ADMITTED_DTR5 = "ADMITTED_DTR5"
}

export interface TaskList {
  tasks: {
    sicCodes: {
      state: TaskState;
      isVisible: boolean;
      url: string;
    };
    statementOfCapital: {
      state: TaskState;
      isVisible: boolean;
      url: string;
    };
    officers: {
      state: TaskState;
      isVisible: boolean;
      url: string;
    };
    peopleSignificantControl: {
      state: TaskState;
      isVisible: boolean;
      url: string;
    };
    shareholders: {
      state: TaskState;
      isVisible: boolean;
      url: string;
    };
    registeredOfficeAddress: {
      state: TaskState;
      isVisible: boolean;
      url: string;
    };
    registerLocations: {
      state: TaskState;
      isVisible: boolean;
    };
  },
  recordDate: string;
  tasksCompletedCount: number;
  allTasksCompleted: boolean;
  csDue: boolean;
}

const TASK_STATE_MAP = {
  [SectionStatus.CONFIRMED]: TaskState.CHECKED,
  [SectionStatus.NOT_CONFIRMED]: TaskState.IN_PROGRESS,
  [SectionStatus.RECENT_FILING]: TaskState.CHECKED
};

const getTaskState = (sectionStatus?: SectionStatus): TaskState => {
  if (!sectionStatus) {
    return TaskState.NOT_CHECKED;
  }
  return TASK_STATE_MAP[sectionStatus];
};

// TODO define interface for data in private sdk?
// const getTaskCount = (data?: ConfirmationStatementSubmissionData): number => {
//   if (!data) {
//     return 0;
//   }
//   const keys: string[] = Object.keys(data);
//   return keys.length;
// };

const getTaskCompletedCount = (data?: ConfirmationStatementSubmissionData): number => {
  if (!data) {
    return 0;
  }

  // TODO use ConfirmationStatementSection interface instead of any?
  const tasks: any[] = Object.values(data);
  let count = 0;

  tasks.forEach(task => {
    const sectionStatus: SectionStatus = task["sectionStatus"];
    if (sectionStatus) {
      const taskState: TaskState = getTaskState(sectionStatus);
      if (taskState === TaskState.CHECKED) {
        count++;
      }
    }
  });
  return count;
};

export const initTaskList = (companyNumber: string, transactionId: string, submissionId: string, confirmationStatement: ConfirmationStatementSubmission): TaskList => {
  return {
    tasks: {
      officers: {
        isVisible: false,
        state: TaskState.NOT_CHECKED,
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_OFFICERS_PATH, companyNumber, transactionId, submissionId)
      },
      peopleSignificantControl: {
        isVisible: false,
        state: TaskState.NOT_CHECKED,
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_PSCS_PATH, companyNumber, transactionId, submissionId)
      },
      registerLocations: {
        isVisible: false,
        state: TaskState.NOT_CHECKED
      },
      registeredOfficeAddress: {
        isVisible: false,
        state: TaskState.NOT_CHECKED,
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTERED_OFFICE_ADDRESS_PATH, companyNumber, transactionId, submissionId)
      },
      shareholders: {
        isVisible: false,
        state: TaskState.NOT_CHECKED,
        url: urlUtils.getUrlWithCompanyNumber(SHAREHOLDERS_PATH, companyNumber)
      },
      sicCodes: {
        isVisible: false,
        state: TaskState.NOT_CHECKED,
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(SIC_PATH, companyNumber, transactionId, submissionId)
      },
      statementOfCapital: {
        isVisible: false,
        state: getTaskState(confirmationStatement.data?.statementOfCapitalData?.sectionStatus),
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId)
      }
    },
    recordDate: toReadableFormat(DateTime.now().toString()),
    tasksCompletedCount: getTaskCompletedCount(confirmationStatement.data),
    allTasksCompleted: false,
    csDue: false
  };
};
