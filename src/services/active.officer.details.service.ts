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
    throw new Error(`Error retrieving active officer details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<ActiveDirectorDetails>;
  return successfulResponse.resource as ActiveDirectorDetails;
};

export const formatOfficerDetails = ( activeDirectorDetails: ActiveDirectorDetails ): ActiveDirectorDetails => {
  activeDirectorDetails.foreName1 = formatTitleCase(activeDirectorDetails.foreName1);
  activeDirectorDetails.nationality = formatTitleCase(activeDirectorDetails.nationality);
  activeDirectorDetails.occupation = formatTitleCase(activeDirectorDetails.occupation);
  activeDirectorDetails.serviceAddressLine1 = formatTitleCase(activeDirectorDetails.serviceAddressLine1);
  activeDirectorDetails.serviceAddressPostTown = formatTitleCase(activeDirectorDetails.serviceAddressPostTown);

  if (activeDirectorDetails.foreName2) {
    activeDirectorDetails.foreName2 = formatTitleCase(activeDirectorDetails.foreName2);
  }
  if (activeDirectorDetails.uraLine1 && activeDirectorDetails.uraPostTown) {
    activeDirectorDetails.uraLine1 = formatTitleCase(activeDirectorDetails.uraLine1);
    activeDirectorDetails.uraPostTown = formatTitleCase(activeDirectorDetails.uraPostTown);
  }
  return activeDirectorDetails;
};
