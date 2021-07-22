import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";

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

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
