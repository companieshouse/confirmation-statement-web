import {
  ConfirmationStatementSubmission,
  SectionStatus
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { taskKeys } from "../../utils/constants";
import { TaskState } from "../../types/task.list";
import { toTaskState } from "./task.state.mapper";

export const getTaskCompletedCount = (csSubmission: ConfirmationStatementSubmission): number => {
  const data = csSubmission.data;
  if (!data) {
    return 0;
  }
  const tasks: any[] = Object.values(data);
  let count = 0;
  tasks.forEach(task => {
    const sectionStatus: SectionStatus = task[taskKeys.SECTION_STATUS_KEY];
    if (sectionStatus) {
      const taskState: TaskState = toTaskState(sectionStatus);
      if (taskState === TaskState.CHECKED) {
        count++;
      }
    }
  });
  return count;
};
