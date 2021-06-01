import { TaskList } from "./task.list";

export const TASK_LIST = "task-list";

export default interface ConfirmationStatementSessionExtraData {
  [TASK_LIST]?: TaskList;
}
