import { Request, Response } from "express";
import { ACTIVE_OFFICERS_DETAILS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import {
  WRONG_DETAILS_UPDATE_OFFICER,
  WRONG_DETAILS_UPDATE_OFFICERS
} from "../../utils/constants";
import { buildWrongDetails } from "../../services/wrong.details.service";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_DETAILS, buildWrongDetails(
    req,
    ACTIVE_OFFICERS_DETAILS_PATH,
    TASK_LIST_PATH,
    WRONG_DETAILS_UPDATE_OFFICER,
    WRONG_DETAILS_UPDATE_OFFICERS
  ));
};
