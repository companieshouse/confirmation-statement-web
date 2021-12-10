import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import {
  ActiveOfficerDetails,
  ConfirmationStatementService
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { OFFICER_ROLE, OFFICER_TYPE } from "../utils/constants";

export const getActiveOfficersDetailsData = async (session: Session, transactionId: string, submissionId: string): Promise<ActiveOfficerDetails[]> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<ActiveOfficerDetails[]> | ApiErrorResponse = await csService.getListActiveOfficerDetails(transactionId, submissionId);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error(`Error retrieving active officer details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<ActiveOfficerDetails[]>;
  return successfulResponse.resource as ActiveOfficerDetails[];
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
