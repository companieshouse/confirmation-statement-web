import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import {
  PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH,
  TASK_LIST_PATH,
  urlParams
} from "../../types/page.urls";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR, RADIO_BUTTON_VALUE } from "../../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
      templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL,
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButtonValue = req.body.pscRadioValue;
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];

    if (pscButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_PSC_DETAILS, {
        templateName: Templates.WRONG_PSC_DETAILS,
        backLinkUrl: urlUtils
          .getUrlWithCompanyNumberTransactionIdAndSubmissionId(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, companyNumber, transactionId, submissionId),
        returnToTaskListUrl: urlUtils
          .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
      });
    }

    return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
      templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL,
      peopleWithSignificantControlErrorMsg: PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
    });
  } catch (e) {
    return next(e);
  }
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
