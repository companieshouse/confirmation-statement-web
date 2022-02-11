import { Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  CHANGE_ROA_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_RO, {
    backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
    taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req)
  });
};
