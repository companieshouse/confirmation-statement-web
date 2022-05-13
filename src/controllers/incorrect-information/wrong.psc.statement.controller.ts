import { Request, Response } from "express";
import {
  PSC_STATEMENT_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_INCORRECT_PSC } from "../../utils/constants";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_PSC_DETAILS, {
    templateName: Templates.WRONG_PSC_DETAILS,
    backLinkUrl: urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req),
    returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    pageHeading: WRONG_DETAILS_INCORRECT_PSC,
  });
};
