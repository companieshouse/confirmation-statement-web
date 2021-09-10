import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createPaymentApiClient } from "./api.service";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { v4 as uuidv4 } from "uuid";
import { createAndLogError, logger } from "../utils/logger";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { API_URL, CHS_URL } from "../utils/properties";

export const startPaymentsSession = async (session: Session, paymentSessionUrl: string,
                                           paymentResourceUri: string, filingResourceUri: string): Promise<ApiResponse<Payment>> => {
  const apiClient: ApiClient = createPaymentApiClient(session, paymentSessionUrl);
  const resourceWithHost = API_URL + paymentResourceUri;
  const createPaymentRequest: CreatePaymentRequest = {
    redirectUri: `${CHS_URL}${filingResourceUri}/confirmation`,
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
