import { Request, Response } from "express";
import {
  PSC_STATEMENT_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_INCORRECT_PSC, WRONG_DETAILS_UPDATE_PSC } from "../../utils/constants";
import { buildWrongDetails } from "../../services/wrong.details.service";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_DETAILS, buildWrongDetails(
    req,
    PSC_STATEMENT_PATH,
    TASK_LIST_PATH,
    WRONG_DETAILS_UPDATE_PSC,
    WRONG_DETAILS_INCORRECT_PSC
  ));
};
