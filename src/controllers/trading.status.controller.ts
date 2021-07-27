import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY_PATH, TASK_LIST_PATH, TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { RADIO_BUTTON_VALUE, TRADING_STATUS_ERROR } from "../utils/constants";
import { urlUtils } from "../utils/url";

export const get = (req: Request, res: Response) => {
  const companyNumber: string = getCompanyNumber(req);
  return res.render(Templates.TRADING_STATUS, {
    backLinkUrl: getConfirmCompanyUrl(companyNumber)
  });
};

export const post = (req: Request, res: Response) => {
  const tradingStatusButtonValue = req.body.tradingStatus;
  const companyNumber = getCompanyNumber(req);
  const transactionId = getTransactionId(req);
  const submissionId = getSubmissionId(req);

  if (tradingStatusButtonValue === RADIO_BUTTON_VALUE.YES) {
    return res.redirect(urlUtils
      .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber,
                                                           transactionId, submissionId));
  }

  if (tradingStatusButtonValue === RADIO_BUTTON_VALUE.NO) {
    return res.render(Templates.TRADING_STOP, {
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, companyNumber,
                                                             transactionId, submissionId)
    });
  }

  return res.render(Templates.TRADING_STATUS, {
    tradingStatusErrorMsg: TRADING_STATUS_ERROR,
    backLinkUrl: getConfirmCompanyUrl(companyNumber),
  });
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
const getTransactionId = (req: Request): string => req.params[urlParams.PARAM_TRANSACTION_ID];
const getSubmissionId = (req: Request): string => req.params[urlParams.PARAM_SUBMISSION_ID];

const getConfirmCompanyUrl = (companyNumber: string): string => `${CONFIRM_COMPANY_PATH}?companyNumber=${companyNumber}`;
