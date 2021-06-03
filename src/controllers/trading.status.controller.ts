import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { TASK_LIST_PATH, urlParams } from "../types/page.urls";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.TRADING_STATUS);
};

export const post = (req: Request, res: Response) => {
  const companyNumber =  req.params[urlParams.PARAM_COMPANY_NUMBER];
  const url = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
  return res.redirect(url);
};
