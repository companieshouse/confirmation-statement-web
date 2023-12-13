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
      url: string;
    };
    statementOfCapital: {
      state: TaskState;
      url: string;
    };
    officers: {
      state: TaskState;
      url: string;
    };
    peopleSignificantControl: {
      state: TaskState;
      url: string;
    };
    shareholders: {
      state: TaskState;
      url: string;
    };
    registeredEmailAddress?: {
      state: TaskState;
      url: string;
    };
    registeredOfficeAddress: {
      state: TaskState;
      url: string;
    };
    registerLocations: {
      state: TaskState;
      url: string;
    };
  },
  recordDate: string;
  tasksExpectedCount: number;
  tasksCompletedCount: number;
  allTasksCompleted: boolean;
  csDue: boolean;
}
