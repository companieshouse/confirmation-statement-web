import { urlParams } from "../types/page.urls";

const getUrlWithCompanyNumber = (url: string, companyNumber: string): string =>
  url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);

const getUrlWithCompanyNumberTransactionIdAndSubmissionId = (url: string, companyNumber: string,
                                                             transactionId: string, submissionId: string): string => {
  url = url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
  url = url.replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId);
  url = url.replace(`:${urlParams.PARAM_SUBMISSION_ID}`, submissionId);
  return url;
};

export const urlUtils = {
  getUrlWithCompanyNumber,
  getUrlWithCompanyNumberTransactionIdAndSubmissionId
};
