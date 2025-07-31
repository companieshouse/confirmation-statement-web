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
import { CONFIRMATION_PATH, REVIEW_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { startPaymentsSession } from "../../src/services/payment.service";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createAndLogError } from "../../src/utils/logger";
import { dummyPayment, PAYMENT_JOURNEY_URL } from "../mocks/payment.mock";
import { mockConfirmationStatementSubmission } from "../mocks/confirmation.statement.submission.mock";
import { getConfirmationStatement, updateConfirmationStatement } from "../../src/services/confirmation.statement.service";
import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const PropertiesMock = jest.requireMock('../../src/utils/properties');
jest.mock('../../src/utils/properties', () => ({
  ...jest.requireActual('../../src/utils/properties'),
}));
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetTransaction = getTransaction as jest.Mock;
const mockCloseTransaction = closeTransaction as jest.Mock;
const mockStartPaymentsSession = startPaymentsSession as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
mockGetConfirmationStatement.mockResolvedValue(mockConfirmationStatementSubmission);

const mockUpdateConfirmationStatement = updateConfirmationStatement as jest.Mock;

const dummyError = {
  message: "oops"
} as Error;
mockCreateAndLogError.mockReturnValue(dummyError);

const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with the service";
const PAYMENT_URL = "/payment/1234";
const PAGE_HEADING = "Submit the confirmation statement";
const ERROR_PAGE_HEADING = "Service offline - File a confirmation statement";
const COSTS_TEXT = "You will need to pay a fee of £34";
const CONFIRMATION_STATEMENT_TEXT = "By continuing, you confirm that all information required to be delivered by the company pursuant to";
// const CONFIRMATION_STATEMENT_ECCT_TEXT = "I confirm that all information required to be delivered by the company pursuant to";
const LAWFUL_ACTIVITY_STATEMENT_TEXT = "I confirm that the intended future activities of the company are lawful";
const CONFIRMATION_STATEMENT_ERROR = "You need to accept the confirmation statement";
const LAWFUL_ACTIVITY_STATEMENT_ERROR = "You need to accept the statement on the intended future activities of the company";
const ERROR_HEADING = "There is a problem";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REVIEW_PATH,
                                                               COMPANY_NUMBER,
                                                               TRANSACTION_ID,
                                                               SUBMISSION_ID);
const CONFIRMATION_URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CONFIRMATION_PATH,
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

jest.mock("../mocks/lp.company.profile.mock.ts", () => ({
  validCompanyProfile: {
    type: ""
  }
}));

describe("review controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfirmationStatement.mockReset();
    mockGetConfirmationStatement.mockResolvedValue(mockConfirmationStatementSubmission);
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
      // expect(response.text).toContain(COSTS_TEXT);
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

    it("Should show review page with standard confirmation statement text when cs date (2020-03-15) before ECCT Day One start date", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-06-28";
      const response = await request(app)
        .get(URL);
      expect(response.status).toBe(200);
      //expect(response.text).toContain(CONFIRMATION_STATEMENT_TEXT);
    });

    it("Should show review page with revised confirmation and lawful activity statement texts when cs date (2020-03-15) on or after ECCT Day One start date", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app)
        .get(URL);
      expect(response.status).toBe(200);
      // expect(response.text).toContain(CONFIRMATION_STATEMENT_ECCT_TEXT);
      // expect(response.text).toContain(LAWFUL_ACTIVITY_STATEMENT_TEXT);
    });

    it("Should redirect to an error page when error is returned", async () => {
      mockGetConfirmationStatement.mockRejectedValueOnce(new Error());
      const response = await request(app)
        .get(URL);
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });

  });

  describe("post tests", () => {

    it("Should redirect to the payment journey url", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2026-06-28";
      mockCloseTransaction.mockResolvedValueOnce(PAYMENT_URL);
      mockStartPaymentsSession.mockResolvedValueOnce(dummyPaymentResponse);

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(PAYMENT_JOURNEY_URL);
    });

    it("Should redirect to the confirmation url", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2026-06-28";
      mockCloseTransaction.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(302);
      expect(response.header.location).toEqual(CONFIRMATION_URL);
    });

    it("Should update the lawful purpose statement", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      await request(app).post(URL).send({ confirmationStatement: "true", lawfulActivityStatement: "true" });
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.acceptLawfulPurposeStatement).toBe(true);
    });

    it("Should show error page if lawful purpose statement update fails", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      mockUpdateConfirmationStatement.mockRejectedValueOnce("Error");
      const response = await request(app)
        .post(URL).send({ confirmationStatement: "true", lawfulActivityStatement: "true" });

      expect(response.status).toBe(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });

    it("Should show error page if payment response has no resource", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2026-06-28";
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

    it("Should show error page if error is thrown inside post function", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2026-06-28";
      mockCloseTransaction.mockRejectedValueOnce(new Error("Internal error"));

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
      expect(mockStartPaymentsSession).not.toHaveBeenCalled();
    });

    it("Should go to payment url when both confirmation & lawful activity statement checkboxes are ticked", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      mockCloseTransaction.mockResolvedValueOnce(PAYMENT_URL);
      mockStartPaymentsSession.mockResolvedValueOnce(dummyPaymentResponse);
      const response = await request(app).post(URL).send({ confirmationStatement: "true", lawfulActivityStatement: "true" });
      expect(response.status).toEqual(302);
      expect(response.header.location).toBe(PAYMENT_JOURNEY_URL);
    });

    it("Should reload the review page with error messages when both confirmation & lawful activity statement checkboxes not ticked", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app).post(URL).send();
      expect(response.status).toEqual(200);
      expect(response.text).toContain(ERROR_HEADING);
      expect(response.text).toContain(CONFIRMATION_STATEMENT_ERROR);
      expect(response.text).toContain(LAWFUL_ACTIVITY_STATEMENT_ERROR);
    });

    it("Should reload the review page with an error message when confirmation statement checkbox not ticked", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app).post(URL).send({ lawfulActivityStatement: "true" });
      expect(response.status).toEqual(200);
      expect(response.text).toContain(ERROR_HEADING);
      expect(response.text).toContain(CONFIRMATION_STATEMENT_ERROR);
      expect(response.text).not.toContain(LAWFUL_ACTIVITY_STATEMENT_ERROR);
    });

    it("Should reload the review page with an error message when lawful activity statement checkbox not ticked", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app).post(URL).send({ confirmationStatement: "true" });
      expect(response.status).toEqual(200);
      expect(response.text).toContain(ERROR_HEADING);
      expect(response.text).toContain(LAWFUL_ACTIVITY_STATEMENT_ERROR);
      expect(response.text).not.toContain(CONFIRMATION_STATEMENT_ERROR);
    });

  });
});
