import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError, logger } from "../utils/logger";
import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";


export const postTransaction = async (session: Session, companyNumber: string, description: string, reference: string) => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  const transaction: Transaction = {
    companyNumber,
    reference,
    description,
  };

  logger.debug(`Creating transaction with company number ${companyNumber}`);
  const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.postTransaction(transaction);

  if (!sdkResponse) {
    throw createAndLogError(`Transaction API returned no response for company number ${companyNumber}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
  }

  const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Transaction API returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse.resource;
};
