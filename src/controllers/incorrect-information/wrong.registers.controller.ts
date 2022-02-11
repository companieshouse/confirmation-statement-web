import { Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  REGISTER_LOCATIONS_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_REGISTER_LOCATIONS, {
    backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
    taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    templateName: Templates.WRONG_REGISTER_LOCATIONS
  });
};
