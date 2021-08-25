import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError, logger } from "../utils/logger";
import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { DESCRIPTION, headers, REFERENCE, transactionStatus } from "../utils/constants";


export const postTransaction = async (session: Session, companyNumber: string, description: string, reference: string): Promise<Transaction> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  const transaction: Transaction = {
    companyNumber,
    reference,
    description,
  };

  logger.debug(`Creating transaction with company number ${companyNumber}`);
  const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.postTransaction(transaction);

  if (!sdkResponse) {
    throw createAndLogError(`Transaction API POST request returned no response for company number ${companyNumber}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
  }

  const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Transaction API POST request returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse.resource;
};

export const closeTransaction = async (session: Session, companyNumber: string, transactionId: string): Promise<string | undefined> => {
  const apiResponse: ApiResponse<Transaction> = await putTransaction(session, companyNumber, transactionId, DESCRIPTION, REFERENCE, transactionStatus.CLOSED);
  if (apiResponse?.headers) {
    return apiResponse.headers[headers.PAYMENT_REQUIRED];
  }
  return undefined;
};

/**
 * Response from PUT transaction can contain a URL in header if payment is needed
 */
export const putTransaction = async (session: Session,
                                     companyNumber: string,
                                     transactionId: string,
                                     transactionDescription: string,
                                     transactionReference: string,
                                     transactionStatus: string): Promise<ApiResponse<Transaction>> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  const transaction: Transaction = {
    companyNumber,
    description: transactionDescription,
    id: transactionId,
    reference: transactionReference,
    status: transactionStatus
  };

  logger.debug(`Updating transaction id ${transactionId} with company number ${companyNumber}, status ${transactionStatus}`);
  const sdkResponse: ApiResponse<Transaction> | ApiErrorResponse = await apiClient.transaction.putTransaction(transaction);

  if (!sdkResponse) {
    throw createAndLogError(`Transaction API PUT request returned no response for transaction id ${transactionId}, company number ${companyNumber}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to put transaction for transaction id ${transactionId}, company number ${companyNumber}`);
  }

  const castedSdkResponse: ApiResponse<Transaction> = sdkResponse as ApiResponse<Transaction>;

  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Transaction API PUT request returned no resource for transaction id ${transactionId}, company number ${companyNumber}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse;
};
