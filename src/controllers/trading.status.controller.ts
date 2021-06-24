import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY_PATH, TASK_LIST_PATH, TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { RADIO_BUTTON_VALUE, TRADING_STATUS_ERROR } from "../utils/constants";
import { getUrlWithCompanyNumber } from "../utils/url";

export const get = (req: Request, res: Response) => {
  const companyNumber: string = getCompanyNumber(req);
  return res.render(Templates.TRADING_STATUS, {
    backLinkUrl: getConfirmCompanyUrl(companyNumber)
  });
};

export const post = (req: Request, res: Response) => {
  const tradingStatusButtonValue = req.body.tradingStatus;
  const companyNumber = getCompanyNumber(req);

  if (tradingStatusButtonValue === RADIO_BUTTON_VALUE.YES) {
    return res.redirect(getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber));
  }

  if (tradingStatusButtonValue === RADIO_BUTTON_VALUE.NO) {
    return res.render(Templates.TRADING_STOP, {
      backLinkUrl: getUrlWithCompanyNumber(TRADING_STATUS_PATH, companyNumber)
    });
  }

  return res.render(Templates.TRADING_STATUS, {
    tradingStatusErrorMsg: TRADING_STATUS_ERROR,
    backLinkUrl: getConfirmCompanyUrl(companyNumber),
  });
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];

const getConfirmCompanyUrl = (companyNumber: string): string => `${CONFIRM_COMPANY_PATH}?companyNumber=${companyNumber}`;
