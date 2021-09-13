import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { TaskState } from "../../../src/types/task.list";
import { toTaskState } from "../../../src/utils/task/task.state.mapper";

describe("TaskState mapper tests", () => {

  describe("toTaskState tests", () => {
    it("Should return TaskState.NOT_CHECKED if supplied with undefined", () => {
      const taskState: TaskState = toTaskState(undefined);
      expect(taskState).toBe(TaskState.NOT_CHECKED);
    });

    it("Should return TaskState.NOT_CHECKED if supplied with null", () => {
      const taskState: TaskState = toTaskState(null as unknown as SectionStatus);
      expect(taskState).toBe(TaskState.NOT_CHECKED);
    });

    it("Should return TaskState.CHECKED if supplied with SectionStatus.CONFIRMED", () => {
      const taskState: TaskState = toTaskState(SectionStatus.CONFIRMED);
      expect(taskState).toBe(TaskState.CHECKED);
    });

    it("Should return TaskState.IN_PROGRESS if supplied with SectionStatus.NOT_CONFIRMED", () => {
      const taskState: TaskState = toTaskState(SectionStatus.NOT_CONFIRMED);
      expect(taskState).toBe(TaskState.IN_PROGRESS);
    });

    it("Should return TaskState.CHECKED if supplied with SectionStatus.RECENT_FILING", () => {
      const taskState: TaskState = toTaskState(SectionStatus.RECENT_FILING);
      expect(taskState).toBe(TaskState.CHECKED);
    });
  });
});
