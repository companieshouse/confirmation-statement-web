import { TaskList, TaskState } from "../../src/types/task.list";

export const mockTaskList: TaskList = {
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
  allTasksCompleted: false,
  csDue: true,
};
