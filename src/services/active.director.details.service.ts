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
  if (activeDirectorDetails.serviceAddress.addressLine1) {
    activeDirectorDetails.serviceAddress.addressLine1 = formatTitleCase(activeDirectorDetails.serviceAddress.addressLine1);
  }
  if (activeDirectorDetails.serviceAddress.postalCode) {
    activeDirectorDetails.serviceAddress.postalCode = formatTitleCase(activeDirectorDetails.serviceAddress.postalCode);
  }

  if (activeDirectorDetails.foreName2) {
    activeDirectorDetails.foreName2 = formatTitleCase(activeDirectorDetails.foreName2);
  }

  if (activeDirectorDetails.residentialAddress.addressLine1 === "") {
    activeDirectorDetails.residentialAddress.addressLine1 = formatTitleCase(activeDirectorDetails.residentialAddress.addressLine1);
  } else {
    if (activeDirectorDetails.residentialAddress.addressLine2) {
      activeDirectorDetails.residentialAddress.addressLine2 = formatTitleCase(activeDirectorDetails.residentialAddress.addressLine2);
    }
  }
  return activeDirectorDetails;
};
