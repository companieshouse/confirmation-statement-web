import * as fs from "fs";
import * as yaml from "js-yaml";
import { editCompanyTypeDisplay } from "./company.type.display.procressor";

interface ApiEnumerationsConstants {
  [propName: string]: any
}

const apiConstantsFile = fs.readFileSync("api-enumerations/constants.yml", "utf8");
const apiConstants: ApiEnumerationsConstants = yaml.load(apiConstantsFile) as ApiEnumerationsConstants;

export const lookupCompanyType = (companyTypeKey: string): string => {
  // we actually use the 'company_summary' values from the yaml file to
  //  display the company type (following the ch.gov.uk templates)
  const displayValue: string = apiConstants.company_summary[companyTypeKey] || companyTypeKey;
  return editCompanyTypeDisplay(companyTypeKey, displayValue);
};

export const lookupCompanyStatus = (companyStatusKey: string): string => {
  return apiConstants.company_status[companyStatusKey] || companyStatusKey;
};
