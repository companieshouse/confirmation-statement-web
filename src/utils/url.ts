import { urlParams } from "../types/page.urls";

export const urlUtils = {
  getUrlWithCompanyNumber: (url: string, companyNumber: string): string => {
    return url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
  }
};
