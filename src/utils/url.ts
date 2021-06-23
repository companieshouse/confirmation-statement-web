import { urlParams } from "../types/page.urls";

export const getUrlWithCompanyNumber = (url: string, companyNumber: string): string =>
  url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
