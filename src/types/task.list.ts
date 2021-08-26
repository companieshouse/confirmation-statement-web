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
      url: string;
    };
  },
  recordDate: string;
  tasksCompletedCount: number;
  allTasksCompleted: boolean;
  csDue: boolean;
}
