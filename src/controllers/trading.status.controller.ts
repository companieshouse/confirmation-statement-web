import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { TASK_LIST_PATH } from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.TRADING_STATUS);
};

export const post = (req: Request, res: Response) => {
  const session: Session = req.session as Session;
  const signInInfo = session.data["signin_info"] as object;
  const companyNumber = signInInfo["company_number"] as string;
  const url = TASK_LIST_PATH.replace(":companyNumber", companyNumber);
  return res.redirect(url);
};
