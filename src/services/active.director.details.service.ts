import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveDirectorDetails, ConfirmationStatementService } from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateOAuthApiClient } from "./api.service";
import { formatTitleCase } from "../utils/format";

export const getActiveDirectorDetailsData = async (session: Session, companyNumber: string): Promise<ActiveDirectorDetails> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<ActiveDirectorDetails> | ApiErrorResponse = await csService.getActiveDirectorDetails(companyNumber);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error(`Error retrieving active director details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<ActiveDirectorDetails>;
  return successfulResponse.resource as ActiveDirectorDetails;
};

export const formatDirectorDetails = ( activeDirectorDetails: ActiveDirectorDetails ): ActiveDirectorDetails => {
  activeDirectorDetails.foreName1 = formatTitleCase(activeDirectorDetails.foreName1);
  activeDirectorDetails.nationality = formatTitleCase(activeDirectorDetails.nationality);
  activeDirectorDetails.occupation = formatTitleCase(activeDirectorDetails.occupation);
  activeDirectorDetails.serviceAddress.careOf = formatTitleCase(activeDirectorDetails.serviceAddress.careOf);
  activeDirectorDetails.serviceAddress.addressLine1 = formatTitleCase(activeDirectorDetails.serviceAddress.addressLine1);
  activeDirectorDetails.serviceAddress.addressLine2 = formatTitleCase(activeDirectorDetails.serviceAddress.addressLine2);
  activeDirectorDetails.serviceAddress.poBox = formatTitleCase(activeDirectorDetails.serviceAddress.poBox);
  activeDirectorDetails.serviceAddress.country = formatTitleCase(activeDirectorDetails.serviceAddress.country);
  activeDirectorDetails.serviceAddress.locality = formatTitleCase(activeDirectorDetails.serviceAddress.locality);
  activeDirectorDetails.serviceAddress.premises = formatTitleCase(activeDirectorDetails.serviceAddress.premises);
  activeDirectorDetails.serviceAddress.region = formatTitleCase(activeDirectorDetails.serviceAddress.region);


  activeDirectorDetails.residentialAddress.careOf = formatTitleCase(activeDirectorDetails.residentialAddress.careOf);
  activeDirectorDetails.residentialAddress.addressLine1 = formatTitleCase(activeDirectorDetails.residentialAddress.addressLine1);
  activeDirectorDetails.residentialAddress.addressLine2 = formatTitleCase(activeDirectorDetails.residentialAddress.addressLine2);
  activeDirectorDetails.residentialAddress.poBox = formatTitleCase(activeDirectorDetails.residentialAddress.poBox);
  activeDirectorDetails.residentialAddress.country = formatTitleCase(activeDirectorDetails.residentialAddress.country);
  activeDirectorDetails.residentialAddress.locality = formatTitleCase(activeDirectorDetails.residentialAddress.locality);
  activeDirectorDetails.residentialAddress.premises = formatTitleCase(activeDirectorDetails.residentialAddress.premises);
  activeDirectorDetails.residentialAddress.region = formatTitleCase(activeDirectorDetails.residentialAddress.region);
  return activeDirectorDetails;
};
