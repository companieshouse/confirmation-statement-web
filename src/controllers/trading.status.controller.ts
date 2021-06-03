import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { TASK_LIST_PATH, urlParams } from "../types/page.urls";
import { TRADING_STATUS_ERROR } from "../utils/constants";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.TRADING_STATUS);
};

export const post = (req: Request, res: Response) => {
  const companyNumber =  req.params[urlParams.PARAM_COMPANY_NUMBER];
  const url = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
  const tradingStatus: string = req.body.tradingStatus;
  console.log("TRADING STATUS: " + tradingStatus);
  if (tradingStatus === "yes") {
    return res.redirect(url);
  } else if (tradingStatus === "no") {
    return res.render(Templates.TRADING_STOP);
  } else {
    return res.render(Templates.TRADING_STATUS, {
      tradingStatusErrorMsg: TRADING_STATUS_ERROR
    });
  }
};
