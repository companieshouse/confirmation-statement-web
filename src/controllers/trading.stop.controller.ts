import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { TRADING_STATUS_PATH } from "../types/page.urls";

export const get = (req: Request, res: Response) => {

  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  return res.render(Templates.TRADING_STOP, {
    backLinkUrl: urlUtils
      .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, companyNumber, transactionId, submissionId),
    templateName: Templates.TRADING_STOP
  });
};
