import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails, ConfirmationStatementService } from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateOAuthApiClient } from "./api.service";
import { formatTitleCase } from "../utils/format";

export const getActiveOfficerDetailsData = async (session: Session, companyNumber: string): Promise<ActiveOfficerDetails> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<ActiveOfficerDetails> | ApiErrorResponse = await csService.getActiveOfficerDetails(companyNumber);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error(`Error retrieving active officer details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<ActiveOfficerDetails>;
  return successfulResponse.resource as ActiveOfficerDetails;
};

export const formatOfficerDetails = ( activeOfficerDetails: ActiveOfficerDetails ): ActiveOfficerDetails => {
  activeOfficerDetails.foreName1 = formatTitleCase(activeOfficerDetails.foreName1);
  activeOfficerDetails.nationality = formatTitleCase(activeOfficerDetails.nationality);
  activeOfficerDetails.occupation = formatTitleCase(activeOfficerDetails.occupation);
  activeOfficerDetails.serviceAddressLine1 = formatTitleCase(activeOfficerDetails.serviceAddressLine1);
  activeOfficerDetails.serviceAddressPostTown = formatTitleCase(activeOfficerDetails.serviceAddressPostTown);

  if (activeOfficerDetails.foreName2) {
    activeOfficerDetails.foreName2 = formatTitleCase(activeOfficerDetails.foreName2);
  }
  if (activeOfficerDetails.uraLine1 && activeOfficerDetails.uraPostTown) {
    activeOfficerDetails.uraLine1 = formatTitleCase(activeOfficerDetails.uraLine1);
    activeOfficerDetails.uraPostTown = formatTitleCase(activeOfficerDetails.uraPostTown);
  }
  return activeOfficerDetails;
};
