import { Request } from "express";
import { urlParams } from "../types/page.urls";

const getUrlWithCompanyNumber = (url: string, companyNumber: string): string =>
  url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);

const getUrlWithCompanyNumberTransactionIdAndSubmissionId = (url: string, companyNumber: string,
                                                             transactionId: string, submissionId: string): string => {
  url = url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, submissionId);
  return url;
};

const getUrlToPath = (pathToPage: string, req: Request): string => {
  return getUrlWithCompanyNumberTransactionIdAndSubmissionId(pathToPage,
                                                             getCompanyNumberFromRequestParams(req),
                                                             getTransactionIdFromRequestParams(req),
                                                             getSubmissionIdFromRequestParams(req)
  );
};

const getCompanyNumberFromRequestParams = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
const getTransactionIdFromRequestParams = (req: Request): string => req.params[urlParams.PARAM_TRANSACTION_ID];
const getSubmissionIdFromRequestParams = (req: Request): string => req.params[urlParams.PARAM_SUBMISSION_ID];

export const urlUtils = {
  getCompanyNumberFromRequestParams,
  getTransactionIdFromRequestParams,
  getSubmissionIdFromRequestParams,
  getUrlToPath,
  getUrlWithCompanyNumber,
  getUrlWithCompanyNumberTransactionIdAndSubmissionId
};
