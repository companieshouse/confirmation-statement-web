import { DateTime } from "luxon";
import { readableFormat } from "../utils/date.formatter";

export enum Task {
    NOT_CHECKED,
    IN_PROGRESS,
    CHECKED
}

export interface TaskList {
    completedTasks: Task;
    exemption: Task;
    activeOfficers: Task;
    activePscs: Task;
    activeMembers: Task;
    additionalPscs: Task;
    additionalOfficers: Task;
    additionalMembers: Task;
    members: Task;
    moment: string;
    officers: Task;
    psc: Task;
    pscStatement: Task;
    register: Task;
    result: number;
    ro: Task;
    statementOfCapital: Task;
    shareholders: Task;
    sic: Task;
    trading: Task;
}

export const initTaskList = (): TaskList => {
  return {
    completedTasks: Task.NOT_CHECKED,
    exemption: Task.NOT_CHECKED,
    activeOfficers: Task.NOT_CHECKED,
    activePscs: Task.NOT_CHECKED,
    activeMembers: Task.NOT_CHECKED,
    additionalPscs: Task.NOT_CHECKED,
    additionalOfficers: Task.NOT_CHECKED,
    additionalMembers: Task.NOT_CHECKED,
    members: Task.NOT_CHECKED,
    moment: readableFormat(DateTime.now().toString()),
    officers: Task.NOT_CHECKED,
    psc: Task.NOT_CHECKED,
    pscStatement: Task.NOT_CHECKED,
    register: Task.NOT_CHECKED,
    result: 0,
    ro: Task.NOT_CHECKED,
    statementOfCapital: Task.NOT_CHECKED,
    shareholders: Task.NOT_CHECKED,
    sic: Task.NOT_CHECKED,
    trading: Task.NOT_CHECKED
  };
};
