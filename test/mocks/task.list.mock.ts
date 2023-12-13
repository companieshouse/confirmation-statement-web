import { TaskList, TaskState } from "../../src/types/task.list";

export const mockTaskListWithEmail: TaskList = {
  tasks: {
    sicCodes: {
      state: TaskState.CHECKED,
      url: "/sic-code",
    },
    statementOfCapital: {
      state: TaskState.NOT_CHECKED,
      url: "/soc"
    },
    officers: {
      state: TaskState.IN_PROGRESS,
      url: "/officers"
    },
    peopleSignificantControl: {
      state: TaskState.CHECKED,
      url: "/psc"
    },
    shareholders: {
      state: TaskState.IN_PROGRESS,
      url: "/shr",
    },
    registeredEmailAddress: {
      state: TaskState.NOT_CHECKED,
      url: "/regemail"
    },
    registeredOfficeAddress: {
      state: TaskState.NOT_CHECKED,
      url: "/regaddr"
    },
    registerLocations: {
      state: TaskState.NOT_CHECKED,
      url: "/regloc"
    },
  },
  recordDate: "16 Jun 2021",
  tasksCompletedCount: 2,
  tasksExpectedCount: 8,
  allTasksCompleted: false,
  csDue: true,
};

export const mockTaskListNoEmail: TaskList = {
  tasks: {
    sicCodes: {
      state: TaskState.CHECKED,
      url: "/sic-code",
    },
    statementOfCapital: {
      state: TaskState.NOT_CHECKED,
      url: "/soc"
    },
    officers: {
      state: TaskState.IN_PROGRESS,
      url: "/officers"
    },
    peopleSignificantControl: {
      state: TaskState.CHECKED,
      url: "/psc"
    },
    shareholders: {
      state: TaskState.IN_PROGRESS,
      url: "/shr",
    },
    registeredEmailAddress: undefined,
    registeredOfficeAddress: {
      state: TaskState.NOT_CHECKED,
      url: "/regaddr"
    },
    registerLocations: {
      state: TaskState.NOT_CHECKED,
      url: "/regloc"
    },
  },
  recordDate: "16 Jun 2021",
  tasksCompletedCount: 2,
  tasksExpectedCount: 7,
  allTasksCompleted: false,
  csDue: true,
};
