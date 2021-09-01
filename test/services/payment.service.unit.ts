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

const PAYMENT_SESSION_URL = "/payment/21321";
const RESOURCE_URI = "/confirmation-statement/65465464";
const PAYMENT_AMOUNT = "13";
const UUID = "d29f8b9c-501d-4ae3-91b2-001fd9e4e0a5";

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

const dummyPayment = {
  amount: PAYMENT_AMOUNT,
  availablePaymentMethods: ["methods"],
  companyNumber: "23213",
  completedAt: "2021-05-23",
  createdAt: "2021-05-23",
  createdBy: {
    email: "ewre",
    forename: "forename",
    id: "342423",
    surname: "testy"
  },
  description: "payment",
  etag: "34324",
  kind: "kind",
  links: {},
  paymentMethod: "visa",
  reference: "3432",
  status: "paid"
} as Payment;

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
      const apiResponse: ApiResponse<Payment> = await startPaymentsSession(session, PAYMENT_SESSION_URL, RESOURCE_URI);

      expect(apiResponse.httpStatusCode).toBe(200);
      expect(apiResponse.resource).toBe(dummyPayment);
      expect(apiResponse.headers).toBe(dummyHeaders);

      const paymentRequest: CreatePaymentRequest = mockCreatePaymentWithFullUrl.mock.calls[0][0];
      expect(paymentRequest.redirectUri).toBe(PAYMENT_SESSION_URL);
      expect(paymentRequest.reference).toBe("CS_REFERENCE");
      expect(paymentRequest.resource).toBe(RESOURCE_URI);
      expect(paymentRequest.state).toBe(UUID);
    });

    it("Should throw error on payment failure 401 response", async () => {
      dummyApiResponse.httpStatusCode = 401;
      mockIsFailure.mockReturnValueOnce(true);
      mockCreatePaymentWithFullUrl.mockResolvedValueOnce(dummyPaymentResult);

      await expect(startPaymentsSession(session, PAYMENT_SESSION_URL, RESOURCE_URI))
        .rejects
        .toThrow(ERROR);

      expect(mockCreateAndLogError).toBeCalledWith("Http status code 401 - Failed to create payment,  {\"error1\":\"something\"}");
    });

    it("Should throw error on payment failure 429 response", async () => {
      dummyApiResponse.httpStatusCode = 429;
      mockIsFailure.mockReturnValueOnce(true);
      mockCreatePaymentWithFullUrl.mockResolvedValueOnce(dummyPaymentResult);

      await expect(startPaymentsSession(session, PAYMENT_SESSION_URL, RESOURCE_URI))
        .rejects
        .toThrow(ERROR);

      expect(mockCreateAndLogError).toBeCalledWith("Http status code 429 - Failed to create payment,  {\"error1\":\"something\"}");
    });

    it("Should throw error on payment failure with unknown http response", async () => {
      dummyApiResponse.httpStatusCode = 500;
      mockIsFailure.mockReturnValueOnce(true);
      mockCreatePaymentWithFullUrl.mockResolvedValueOnce(dummyPaymentResult);

      await expect(startPaymentsSession(session, PAYMENT_SESSION_URL, RESOURCE_URI))
        .rejects
        .toThrow(ERROR);

      expect(mockCreateAndLogError).toBeCalledWith("Unknown Error");
    });
  });
});
