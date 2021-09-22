import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createPaymentApiClient } from "./api.service";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { v4 as uuidv4 } from "uuid";
import { createAndLogError, logger } from "../utils/logger";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { API_URL, CHS_URL } from "../utils/properties";
import { PAYMENT_CALLBACK_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";

export const startPaymentsSession = async (session: Session, paymentSessionUrl: string,
                                           paymentResourceUri: string, submissionId: string, transactionId: string, companyNumber: string): Promise<ApiResponse<Payment>> => {
  const apiClient: ApiClient = createPaymentApiClient(session, paymentSessionUrl);
  const resourceWithHost = API_URL + paymentResourceUri;
  const reference: string = "Confirmation_Statement_" + transactionId;
  const redirectUri: string = urlUtils
    .getUrlWithCompanyNumberTransactionIdAndSubmissionId(`${CHS_URL}${PAYMENT_CALLBACK_PATH}`,
                                                         companyNumber, transactionId, submissionId);

  const createPaymentRequest: CreatePaymentRequest = {
    redirectUri: redirectUri,
    reference: reference,
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
