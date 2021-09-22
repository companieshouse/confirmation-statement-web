jest.mock("../../src/utils/logger");
jest.mock("../../src/services/api.service");
jest.mock("uuid");

import { Session } from "@companieshouse/node-session-handler";
import { createAndLogError } from "../../src/utils/logger";
import { createPaymentApiClient } from "../../src/services/api.service";
import { startPaymentsSession } from "../../src/services/payment.service";
import { ApiResponse, ApiResult } from "@companieshouse/api-sdk-node/dist/services/resource";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { v4 as uuidv4 } from "uuid";
import { API_URL } from "../../src/utils/properties";
import { dummyPayment } from "../mocks/payment.mock";

const PAYMENT_SESSION_URL = "/payment/21321";
const PAYMENT_RESOURCE_URI = "/confirmation-statement/65465464";
const SUBMISSION_ID = "65465464";
const TRANSACTION_ID = "987654321";
const COMPANY_NUMBER = "12345678";
const UUID = "d29f8b9c-501d-4ae3-91b2-001fd9e4e0a5";
const REFERENCE = "Confirmation_Statement_" + TRANSACTION_ID;

const mockCreatePaymentWithFullUrl = jest.fn();
const mockCreatePaymentApiClient = createPaymentApiClient as jest.Mock;
mockCreatePaymentApiClient.mockReturnValue({
  payment: {
    createPaymentWithFullUrl: mockCreatePaymentWithFullUrl
  }
});

const mockIsFailure = jest.fn();
mockIsFailure.mockReturnValue(false);

const mockIsSuccess = jest.fn();
mockIsSuccess.mockReturnValue(true);

const mockUuidv4 = uuidv4 as jest.Mock;
mockUuidv4.mockReturnValue(UUID);

const mockCreateAndLogError = createAndLogError as jest.Mock;
const ERROR: Error = new Error("oops");
mockCreateAndLogError.mockReturnValue(ERROR);

const dummyHeaders = {
  header1: "45435435"
};

const dummyErrors = {
  error1: "something"
};

const dummyApiResponse = {
  errors: dummyErrors,
  headers: dummyHeaders,
  httpStatusCode: 200,
  resource: dummyPayment
} as ApiResponse<Payment>;

const dummyPaymentResult = {
  isFailure: mockIsFailure,
  value: dummyApiResponse,
  isSuccess: mockIsSuccess
} as ApiResult<ApiResponse<Payment>>;

let session: any;

describe("Payment Service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("startPaymentsSession tests", () => {

    it("Should return a successful response", async () => {
      dummyApiResponse.httpStatusCode = 200;
      mockCreatePaymentWithFullUrl.mockResolvedValueOnce(dummyPaymentResult);
      const apiResponse: ApiResponse<Payment> = await startPaymentsSession(session, PAYMENT_SESSION_URL,
                                                                           PAYMENT_RESOURCE_URI, SUBMISSION_ID,
                                                                           TRANSACTION_ID, COMPANY_NUMBER);

      expect(apiResponse.httpStatusCode).toBe(200);
      expect(apiResponse.resource).toBe(dummyPayment);
      expect(apiResponse.headers).toBe(dummyHeaders);

      expect(mockCreatePaymentApiClient).toBeCalledWith(session, PAYMENT_SESSION_URL);

      const paymentRequest: CreatePaymentRequest = mockCreatePaymentWithFullUrl.mock.calls[0][0];
      expect(paymentRequest.redirectUri).toBe("http://chs.local/confirmation-statement/company/12345678/transaction/987654321/submission/65465464/payment-callback");
      expect(paymentRequest.reference).toBe(REFERENCE);
      expect(paymentRequest.resource).toBe(API_URL + PAYMENT_RESOURCE_URI);
      expect(paymentRequest.state).toBe(UUID);
    });

    it("Should throw error on payment failure 401 response", async () => {
      dummyApiResponse.httpStatusCode = 401;
      mockIsFailure.mockReturnValueOnce(true);
      mockCreatePaymentWithFullUrl.mockResolvedValueOnce(dummyPaymentResult);

      await expect(startPaymentsSession(session, PAYMENT_SESSION_URL,
                                        PAYMENT_RESOURCE_URI, SUBMISSION_ID,
                                        TRANSACTION_ID, COMPANY_NUMBER))
        .rejects
        .toThrow(ERROR);

      expect(mockCreateAndLogError).toBeCalledWith("Http status code 401 - Failed to create payment,  {\"error1\":\"something\"}");
    });

    it("Should throw error on payment failure 429 response", async () => {
      dummyApiResponse.httpStatusCode = 429;
      mockIsFailure.mockReturnValueOnce(true);
      mockCreatePaymentWithFullUrl.mockResolvedValueOnce(dummyPaymentResult);

      await expect(startPaymentsSession(session, PAYMENT_SESSION_URL,
                                        PAYMENT_RESOURCE_URI, SUBMISSION_ID,
                                        TRANSACTION_ID, COMPANY_NUMBER))
        .rejects
        .toThrow(ERROR);

      expect(mockCreateAndLogError).toBeCalledWith("Http status code 429 - Failed to create payment,  {\"error1\":\"something\"}");
    });

    it("Should throw error on payment failure with unknown http response", async () => {
      dummyApiResponse.httpStatusCode = 500;
      mockIsFailure.mockReturnValueOnce(true);
      mockCreatePaymentWithFullUrl.mockResolvedValueOnce(dummyPaymentResult);

      await expect(startPaymentsSession(session, PAYMENT_SESSION_URL,
                                        PAYMENT_RESOURCE_URI, SUBMISSION_ID,
                                        TRANSACTION_ID, COMPANY_NUMBER))
        .rejects
        .toThrow(ERROR);

      expect(mockCreateAndLogError).toBeCalledWith('Unknown Error {"error1":"something"}');
    });
  });
});
