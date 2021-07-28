import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR } from "../../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const template: string = getTemplate(false);
    return res.render(template, {
      templateName: template,
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
    });
  } catch (e) {
    return next(e);
  }
};

const getTemplate = (isRle): string => {
  if (isRle) {
    return Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL_RLE;
  } else {
    return Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL;
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const template: string = getTemplate(false);
    return res.render(template, {
      templateName: template,
      peopleWithSignificantControlErrorMsg: PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
    });
  } catch (e) {
    return next(e);
  }
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
