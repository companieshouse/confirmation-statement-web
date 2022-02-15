import { Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  ACTIVE_PSC_DETAILS_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_INCORRECT_PSC, WRONG_DETAILS_UPDATE_PSC } from "../../utils/constants";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_DETAILS, {
    templateName: Templates.WRONG_DETAILS,
    backLinkUrl: urlUtils.getUrlToPath(ACTIVE_PSC_DETAILS_PATH, req),
    returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    stepOneHeading: WRONG_DETAILS_UPDATE_PSC,
    pageHeading: WRONG_DETAILS_INCORRECT_PSC,
  });
};
