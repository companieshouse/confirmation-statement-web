import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY_PATH, TASK_LIST_PATH, TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { TRADING_STATUS_ERROR } from "../utils/constants";

export const get = (req: Request, res: Response) => {
  const companyNumber =  req.params[urlParams.PARAM_COMPANY_NUMBER];
  const backLinkUrl = `${CONFIRM_COMPANY_PATH}?companyNumber=${companyNumber}`;
  return res.render(Templates.TRADING_STATUS, {
    backLinkUrl
  });
};

export const post = (req: Request, res: Response) => {
  const companyNumber =  req.params[urlParams.PARAM_COMPANY_NUMBER];
  const url = TASK_LIST_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
  const tradingStatus: string = req.body.tradingStatus;
  if (tradingStatus === "yes") {
    return res.redirect(url);
  } else if (tradingStatus === "no") {
    const backLinkUrl = TRADING_STATUS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
    return res.render(Templates.TRADING_STOP, {
      backLinkUrl
    });
  } else {
    return res.render(Templates.TRADING_STATUS, {
      tradingStatusErrorMsg: TRADING_STATUS_ERROR
    });
  }
};
