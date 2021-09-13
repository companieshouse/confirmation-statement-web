import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { TaskState } from "../../types/task.list";

const TASK_STATE_MAP = {
  [SectionStatus.CONFIRMED]: TaskState.CHECKED,
  [SectionStatus.NOT_CONFIRMED]: TaskState.IN_PROGRESS,
  [SectionStatus.RECENT_FILING]: TaskState.CHECKED
};

export const toTaskState = (sectionStatus?: SectionStatus): TaskState => {
  if (!sectionStatus) {
    return TaskState.NOT_CHECKED;
  }
  return TASK_STATE_MAP[sectionStatus];
};
