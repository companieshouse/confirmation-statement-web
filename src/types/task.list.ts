import { DateTime } from "luxon";
import { toReadableFormat } from "../utils/date";

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
    exemptionState: TaskState;
    membersState: TaskState;
    recordDate: string;
    officersState: TaskState;
    pscState: TaskState;
    pscStatement: TaskState;
    registerState: TaskState;
    tasksCompleted: number;
    roState: TaskState;
    statementOfCapitalState: TaskState;
    shareholdersState: TaskState;
    sicState: TaskState;
    tradingStatus: TradingStatus;
    allTasksCompleted: boolean;
    csDue: boolean;
}

export const initTaskList = (): TaskList => {
  return {
    exemptionState: TaskState.NOT_CHECKED,
    membersState: TaskState.NOT_CHECKED,
    recordDate: toReadableFormat(DateTime.now().toString()),
    officersState: TaskState.NOT_CHECKED,
    pscState: TaskState.NOT_CHECKED,
    pscStatement: TaskState.NOT_CHECKED,
    registerState: TaskState.NOT_CHECKED,
    tasksCompleted: 0,
    roState: TaskState.NOT_CHECKED,
    statementOfCapitalState: TaskState.NOT_CHECKED,
    shareholdersState: TaskState.NOT_CHECKED,
    sicState: TaskState.NOT_CHECKED,
    tradingStatus: TradingStatus.ADMITTED,
    allTasksCompleted: false,
    csDue: false
  };
};
