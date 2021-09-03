jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/transaction.service");
jest.mock("../../src/services/confirmation.statement.service");
jest.mock("../../src/services/payment.service");
jest.mock("../../src/utils/logger");

import { closeTransaction, getTransaction } from "../../src/services/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import { REVIEW_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { startPaymentsSession } from "../../src/services/payment.service";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createAndLogError } from "../../src/utils/logger";
import { dummyPayment, PAYMENT_JOURNEY_URL } from "../mocks/payment.mock";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetTransaction = getTransaction as jest.Mock;
const mockCloseTransaction = closeTransaction as jest.Mock;
const mockStartPaymentsSession = startPaymentsSession as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;

const dummyError = {
  message: "oops"
} as Error;
mockCreateAndLogError.mockReturnValue(dummyError);

const SERVICE_UNAVAILABLE_TEXT = "Sorry, the service is unavailable";
const PAYMENT_URL = "/payment/1234";
const PAGE_HEADING = "Submit the confirmation statement";
const ERROR_PAGE_HEADING = "Service offline - File a confirmation statement";
const COSTS_TEXT = "You will need to pay a fee";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REVIEW_PATH,
                                                               COMPANY_NUMBER,
                                                               TRANSACTION_ID,
                                                               SUBMISSION_ID);

const dummyTransactionNoCosts = {
  id: TRANSACTION_ID
} as Transaction;

const dummyTransactionWithCosts = {
  id: TRANSACTION_ID,
  companyNumber: "12412",
  reference: "424",
  description: "stuff",
  resources: {
    [`/tran/21321321/confirmation-statement/${SUBMISSION_ID}`]: {
      kind: "erewr",
      links: {
        resource: "eerwrewr",
        costs: "/343543543"
      }
    }
  }
} as Transaction;

const dummyTransactionWithCostsWithDifferentResourceKey = {
  id: TRANSACTION_ID,
  companyNumber: "12412",
  reference: "424",
  description: "stuff",
  resources: {
    [`/tran/21321321/confirmation-statement/123456`]: {
      kind: "erewr",
      links: {
        resource: "eerwrewr",
        costs: "/343543543"
      }
    }
  }
} as Transaction;

const dummyHeaders = {
  header1: "45435435"
};

const dummyPaymentResponse = {
  headers: dummyHeaders,
  httpStatusCode: 200,
  resource: dummyPayment
} as ApiResponse<Payment>;

describe("review controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get tests", () => {
    it("should show review page with no costs text", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      const response = await request(app)
        .get(URL);

      expect(response.status).toBe(200);
      expect(mockGetTransaction).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).not.toContain(COSTS_TEXT);
      expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show review page with costs text", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);
      const response = await request(app)
        .get(URL);

      expect(response.status).toBe(200);
      expect(mockGetTransaction).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(COSTS_TEXT);
      expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show error screen when no transaction returned", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(undefined);
      const response = await request(app)
        .get(URL);

      expect(response.status).toBe(500);
      expect(mockGetTransaction).toBeCalledTimes(1);
      expect(response.text).toContain(ERROR_PAGE_HEADING);
      expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("should show review page with no costs text when resource is wrong type", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCostsWithDifferentResourceKey);
      const response = await request(app)
        .get(URL);

      expect(response.status).toBe(200);
      expect(mockGetTransaction).toBeCalledTimes(1);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).not.toContain(COSTS_TEXT);
      expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });
  });

  describe("post tests", () => {
    it("Should redirect to the payment journey url", async () => {
      mockCloseTransaction.mockResolvedValueOnce(PAYMENT_URL);
      mockStartPaymentsSession.mockResolvedValueOnce(dummyPaymentResponse);

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(PAYMENT_JOURNEY_URL);
    });

    it("Should show error page if payment response has no resource", async () => {
      mockCloseTransaction.mockResolvedValueOnce(PAYMENT_URL);
      mockStartPaymentsSession.mockResolvedValueOnce({
        headers: dummyHeaders,
        httpStatusCode: 200
      } as ApiResponse<Payment>);

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
      expect(mockCreateAndLogError).toBeCalledWith("No resource in payment response");
    });

    it("Should show error page if closing transaction does not return a url (this will change to a redirect to final page when that page is ready)", async () => {
      mockCloseTransaction.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
      expect(mockCreateAndLogError).toBeCalledWith("Not yet supported");
    });

    it("Should show error page if error is thrown inside post function", async () => {
      mockCloseTransaction.mockRejectedValueOnce(new Error("Internal error"));

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
      expect(mockStartPaymentsSession).not.toHaveBeenCalled();
    });
  });
});
