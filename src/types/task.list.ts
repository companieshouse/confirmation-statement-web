import { DateTime } from "luxon";
import { readableFormat } from "../utils/date.formatter";

export enum TaskState {
    NOT_CHECKED,
    IN_PROGRESS,
    CHECKED
}

export enum TradingStatus {
  NOT_ADMITTED,
  ADMITTED,
  ADMITTED_DTR5
}

export interface TaskList {
    completedTasks: TaskState;
    exemption: TaskState;
    activeOfficers: TaskState;
    activePscs: TaskState;
    activeMembers: TaskState;
    additionalPscs: TaskState;
    additionalOfficers: TaskState;
    additionalMembers: TaskState;
    members: TaskState;
    recordDate: string;
    officers: TaskState;
    psc: TaskState;
    pscStatement: TaskState;
    register: TaskState;
    result: number;
    ro: TaskState;
    statementOfCapital: TaskState;
    shareholders: TaskState;
    sic: TaskState;
    trading: TaskState;
}

export const initTaskList = (): TaskList => {
  return {
    completedTasks: TaskState.NOT_CHECKED,
    exemption: TaskState.NOT_CHECKED,
    activeOfficers: TaskState.NOT_CHECKED,
    activePscs: TaskState.NOT_CHECKED,
    activeMembers: TaskState.NOT_CHECKED,
    additionalPscs: TaskState.NOT_CHECKED,
    additionalOfficers: TaskState.NOT_CHECKED,
    additionalMembers: TaskState.NOT_CHECKED,
    members: TaskState.NOT_CHECKED,
    recordDate: readableFormat(DateTime.now().toString()),
    officers: TaskState.NOT_CHECKED,
    psc: TaskState.NOT_CHECKED,
    pscStatement: TaskState.NOT_CHECKED,
    register: TaskState.NOT_CHECKED,
    result: 0,
    ro: TaskState.NOT_CHECKED,
    statementOfCapital: TaskState.NOT_CHECKED,
    shareholders: TaskState.NOT_CHECKED,
    sic: TaskState.NOT_CHECKED,
    trading: TaskState.NOT_CHECKED
  };
};
