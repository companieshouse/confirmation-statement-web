import { DateTime } from "luxon";
import { toReadableFormat } from "../utils/date";
import { ACTIVE_PSCS_PATH, SIC_PATH, STATEMENT_OF_CAPITAL_PATH, ACTIVE_OFFICERS_PATH } from "./page.urls";
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
    };
    registeredOfficeAddress: {
      state: TaskState;
      isVisible: boolean;
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

export const initTaskList = (companyNumber: string): TaskList => {
  return {
    tasks: {
      officers: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils.getUrlWithCompanyNumber(ACTIVE_OFFICERS_PATH, companyNumber) },
      peopleSignificantControl: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils.getUrlWithCompanyNumber(ACTIVE_PSCS_PATH, companyNumber) },
      registerLocations: { isVisible: false, state: TaskState.NOT_CHECKED },
      registeredOfficeAddress: { isVisible: false, state: TaskState.NOT_CHECKED },
      shareholders: { isVisible: false, state: TaskState.NOT_CHECKED },
      sicCodes: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils.getUrlWithCompanyNumber(SIC_PATH, companyNumber) },
      statementOfCapital: { isVisible: false, state: TaskState.NOT_CHECKED, url: urlUtils.getUrlWithCompanyNumber(STATEMENT_OF_CAPITAL_PATH, companyNumber) }
    },
    recordDate: toReadableFormat(DateTime.now().toString()),
    tasksCompleted: 0,
    allTasksCompleted: false,
    csDue: false
  };
};
