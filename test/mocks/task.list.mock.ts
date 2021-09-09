import { TaskList, TaskState } from "../../src/types/task.list";

export const mockTaskList: TaskList = {
  tasks: {
    sicCodes: {
      state: TaskState.CHECKED,
      isVisible: true,
      url: "/sic-code",
    },
    statementOfCapital: {
      state: TaskState.NOT_CHECKED,
      isVisible: false,
      url: "/soc"
    },
    officers: {
      state: TaskState.IN_PROGRESS,
      isVisible: true,
      url: "/officers"
    },
    peopleSignificantControl: {
      state: TaskState.CHECKED,
      isVisible: true,
      url: "/psc"
    },
    shareholders: {
      state: TaskState.IN_PROGRESS,
      isVisible: true,
      url: "/shr",
    },
    registeredOfficeAddress: {
      state: TaskState.NOT_CHECKED,
      isVisible: true,
      url: "/regaddr"
    },
    registerLocations: {
      state: TaskState.NOT_CHECKED,
      isVisible: false,
      url: "/regloc"
    },
  },
  recordDate: "16 Jun 2021",
  tasksCompletedCount: 2,
  allTasksCompleted: false,
  csDue: true,
};
