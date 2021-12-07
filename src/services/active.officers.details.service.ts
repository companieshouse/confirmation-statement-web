import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPublicApiKeyClient } from "./api.service";
import { CompanyOfficer, CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers";
import { createAndLogError } from "../utils/logger";
import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { OFFICER_ROLE, OFFICER_TYPE } from "../utils/constants";
import { COMPANY_OFFICERS_ACTIVE_MAX_ALLOWED, COMPANY_OFFICERS_API_PAGE_SIZE } from "../utils/properties";

export const getActiveOfficersDetailsData = async (companyNumber: string): Promise<CompanyOfficer[]> => {
  const client = createPublicApiKeyClient();
  const pageSize: number = parseInt(COMPANY_OFFICERS_API_PAGE_SIZE, 10);

  const companyOfficersDetailsResource: Resource<CompanyOfficers> = await client.companyOfficers.getCompanyOfficers(companyNumber, pageSize, 0, false, "resigned_on");
  const companyOfficersDetails: CompanyOfficers = companyOfficersDetailsResource.resource as CompanyOfficers;
  const status = companyOfficersDetailsResource.httpStatusCode;

  if (status >= 400) {
    const errorResponse = companyOfficersDetailsResource as ApiErrorResponse;
    throw new Error(`Error retrieving active officer details: ${JSON.stringify(errorResponse)}`);
  }
  const maxActiveOfficersAllowed: number = parseInt(COMPANY_OFFICERS_ACTIVE_MAX_ALLOWED, 10);
  const activeOfficerCountFound: number = parseInt(companyOfficersDetails.activeCount, 10);

  if (activeOfficerCountFound > maxActiveOfficersAllowed) {
    throw createAndLogError(`Active officer count for company ${companyNumber} is greater than ${maxActiveOfficersAllowed} with value of ${companyOfficersDetails.activeCount}`);
  }
  if (activeOfficerCountFound === 0) {
    throw createAndLogError(`No active officers found for company ${companyNumber}, active count is 0`);
  }

  return companyOfficersDetails.items.filter(companyOfficer => !companyOfficer.resignedOn);
};

export const getOfficerTypeList = (officerList: ActiveOfficerDetails[]) => {
  const officerTypeList = new Array(0);
  for (const officer of officerList){
    if (OFFICER_ROLE.SECRETARY.localeCompare(officer.role, 'en', { sensitivity: 'accent' }) === 0 && !officer.isCorporate){
      officerTypeList.push(OFFICER_TYPE.NATURAL_SECRETARY);
    }
    if (OFFICER_ROLE.SECRETARY.localeCompare(officer.role, 'en', { sensitivity: 'accent' }) === 0 && officer.isCorporate){
      officerTypeList.push(OFFICER_TYPE.CORPORATE_SECRETARIES);
    }
    if (OFFICER_ROLE.DIRECTOR.localeCompare(officer.role, 'en', { sensitivity: 'accent' }) === 0 && !officer.isCorporate){
      officerTypeList.push(OFFICER_TYPE.NATURAL_DIRECTOR);
    }
    if (OFFICER_ROLE.DIRECTOR.localeCompare(officer.role, 'en', { sensitivity: 'accent' }) === 0 && officer.isCorporate){
      officerTypeList.push(OFFICER_TYPE.CORPORATE_DIRECTORS);
    }
  }
  return officerTypeList;
};
