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
  tasksCompleted: number;
  allTasksCompleted: boolean;
  csDue: boolean;
}

export const initTaskList = (companyNumber: string, transactionId: string, submissionId: string): TaskList => {
  return {
    tasks: {
      officers: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_OFFICERS_PATH, companyNumber, transactionId, submissionId) },
      peopleSignificantControl: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_PSCS_PATH, companyNumber, transactionId, submissionId) },
      registerLocations: { isVisible: false, state: TaskState.NOT_CHECKED },
      registeredOfficeAddress: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTERED_OFFICE_ADDRESS_PATH, companyNumber, transactionId, submissionId) },
      shareholders: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils.getUrlWithCompanyNumber(SHAREHOLDERS_PATH, companyNumber) },
      sicCodes: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(SIC_PATH, companyNumber, transactionId, submissionId) },
      statementOfCapital: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId) }
    },
    recordDate: toReadableFormat(DateTime.now().toString()),
    tasksCompleted: 0,
    allTasksCompleted: false,
    csDue: false
  };
};
