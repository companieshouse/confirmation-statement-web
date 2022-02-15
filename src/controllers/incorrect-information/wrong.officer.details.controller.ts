import { Request, Response } from "express";
import { ACTIVE_OFFICERS_DETAILS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import {
  WRONG_DETAILS_UPDATE_OFFICER,
  WRONG_DETAILS_UPDATE_OFFICERS
} from "../../utils/constants";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_DETAILS, {
    templateName: Templates.WRONG_DETAILS,
    backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_DETAILS_PATH, req),
    returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    stepOneHeading: WRONG_DETAILS_UPDATE_OFFICER,
    pageHeading: WRONG_DETAILS_UPDATE_OFFICERS
  });
};
