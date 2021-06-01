import { DateTime } from "luxon";
import { readableFormat } from "../utils/date.formatter";

export interface TaskList {
    completedTasks: string;
    email: string;
    exemption: string;
    activeOfficers: string;
    activePscs: string;
    activeMembers: string;
    additionalPscs: string;
    additionalOfficers: string;
    additionalMembers: string;
    members: string;
    moment: string;
    officers: string;
    psc: string;
    pscStatement: string;
    register: string;
    result: number;
    ro: string;
    statementOfCapital: string;
    shareholders: string;
    sic: string;
    trading: string;
}

export const initTaskList = (): TaskList => {
  return {
    completedTasks: "",
    email: "",
    exemption: "",
    activeOfficers: "",
    activePscs: "",
    activeMembers: "",
    additionalPscs: "",
    additionalOfficers: "",
    additionalMembers: "",
    members: "",
    moment: readableFormat(DateTime.now().toString()),
    officers: "",
    psc: "",
    pscStatement: "",
    register: "",
    result: 0,
    ro: "",
    statementOfCapital: "",
    shareholders: "",
    sic: "",
    trading: ""
  };
};
