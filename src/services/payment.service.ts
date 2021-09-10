import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createPaymentApiClient } from "./api.service";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { v4 as uuidv4 } from "uuid";
import { createAndLogError, logger } from "../utils/logger";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { API_URL, CHS_URL } from "../utils/properties";
import { CONFIRMATION_PATH, urlParams } from "../types/page.urls";

export const startPaymentsSession = async (session: Session, paymentSessionUrl: string,
                                           paymentResourceUri: string, submissionId: string, transactionId: string, companyNumber: string): Promise<ApiResponse<Payment>> => {
  const apiClient: ApiClient = createPaymentApiClient(session, paymentSessionUrl);
  const resourceWithHost = API_URL + paymentResourceUri;
  const redirectUri: string = `${CHS_URL}${CONFIRMATION_PATH}`
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId)
    .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, submissionId);

  const createPaymentRequest: CreatePaymentRequest = {
    redirectUri: redirectUri,
    reference: "CS_REFERENCE",
    resource: resourceWithHost,
    state: uuidv4(),
  };
  const paymentResult = await apiClient.payment.createPaymentWithFullUrl(createPaymentRequest);

  if (paymentResult.isFailure()) {
    const errorResponse = paymentResult.value;
    logger.error(`${errorResponse?.httpStatusCode} - ${JSON.stringify(errorResponse?.errors)}`);
    if (errorResponse.httpStatusCode === 401 || errorResponse.httpStatusCode === 429) {
      throw createAndLogError(`Http status code ${errorResponse.httpStatusCode} - Failed to create payment,  ${JSON.stringify(errorResponse?.errors) || "Unknown Error"}`);
    } else {
      throw createAndLogError(`Unknown Error ${JSON.stringify(errorResponse?.errors) || "No Errors found in response"}`);
    }
  } else {
    logger.info(`Create payment, status_code=${paymentResult.value.httpStatusCode}`);
    return paymentResult.value;
  }
};
