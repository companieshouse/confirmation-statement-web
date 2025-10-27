jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/transaction.service");
jest.mock("../../src/services/confirmation.statement.service");
jest.mock("../../src/services/payment.service", () => ({
  startPaymentsSession: jest.fn()
}));
jest.mock("../../src/utils/logger");

import { closeTransaction, getTransaction } from "../../src/services/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import { CONFIRMATION_PATH, LP_CHECK_YOUR_ANSWER_PATH, LP_CONFIRMATION_PATH, LP_CS_DATE_PATH, LP_REVIEW_PATH, LP_SIC_CODE_SUMMARY_PATH, REVIEW_PATH, urlParams } from '../../src/types/page.urls';
import { urlUtils } from "../../src/utils/url";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { startPaymentsSession } from "../../src/services/payment.service";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createAndLogError } from "../../src/utils/logger";
import { dummyPayment, PAYMENT_JOURNEY_URL } from "../mocks/payment.mock";
import { mockConfirmationStatementSubmission } from "../mocks/confirmation.statement.submission.mock";
import { getConfirmationStatement } from "../../src/services/confirmation.statement.service";
import { Request, Response, NextFunction } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { DMMMMYYYY_DATE_FORMAT, LIMITED_PARTNERSHIP_COMPANY_TYPE, LIMITED_PARTNERSHIP_SUBTYPES, CONFIRMATION_STATEMENT_SESSION_KEY, LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY } from "../../src/utils/constants";
import * as sessionAcspUtils from "../../src/utils/session.acsp";
import * as limitedPartnershipUtils from "../../src/utils/limited.partnership";
import { getFormattedConfirmationDate } from "../../src/utils/date";
import moment from "moment";
// import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
// import { isPaymentDue } from "../../src/utils/payments";

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

const dummyError = {
  message: "oops"
} as Error;
mockCreateAndLogError.mockReturnValue(dummyError);

const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with the service";
const PAYMENT_URL = "/payment/1234";
const PAGE_HEADING = "Submit the confirmation statement";
const ERROR_PAGE_HEADING = "Service offline - File a confirmation statement";
const COSTS_TEXT = "You will need to pay a fee of &pound;34";
const CONFIRMATION_STATEMENT_TEXT = "By continuing, you confirm that all information required to be delivered by the company pursuant to";
const CONFIRMATION_STATEMENT_ECCT_TEXT = "confirm that all information required to be delivered by the company pursuant to";
const CONFIRMATION_STATEMENT_ERROR = "Select if all required information is either delivered or being delivered for the confirmation statement date";
const LAWFUL_ACTIVITY_STATEMENT_ERROR = "Select if intended future activities are lawful";
const ERROR_HEADING = "There is a problem";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REVIEW_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const LP_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(LP_REVIEW_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const CONFIRMATION_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CONFIRMATION_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);
const LP_CONFIRMATION_URL = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(LP_CONFIRMATION_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID);

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

function setupLimitedPartnershipCompany() {
  const mockLimitedPartnership = {
    companyNumber: COMPANY_NUMBER,
    type: "limited-partnership",
    subtype: "limited-partnership",
    jurisdiction: "england-wales",
    companyName: "Test Company"
  };

  mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);

}

function setupScottishLimitedPartnershipCompany() {
  const mockScottishLimitedPartnership = {
    companyNumber: COMPANY_NUMBER,
    type: "limited-partnership",
    subtype: "scottish-limited-partnership",
    jurisdiction: "scotland",
    companyName: "Test Company"
  };

  mockGetCompanyProfile.mockResolvedValueOnce(mockScottishLimitedPartnership);

}


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
      (getCompanyProfile as jest.Mock).mockResolvedValue({
        companyNumber: COMPANY_NUMBER,
        type: "ltd",
        companyName: "Test Company"
      });
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

    it("Should show review page with standard confirmation statement text when cs date (2020-03-15) before ECCT Day One start date", async () => {
      (getCompanyProfile as jest.Mock).mockResolvedValue({
        companyNumber: COMPANY_NUMBER,
        type: "ltd",
        companyName: "Test Company"
      });
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-06-28";
      const response = await request(app)
        .get(URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain(CONFIRMATION_STATEMENT_TEXT);
    });

    it("Should show review page with revised confirmation and lawful activity statement texts when cs date (2020-03-15) on or after ECCT Day One start date", async () => {
      (getCompanyProfile as jest.Mock).mockResolvedValue({
        companyNumber: COMPANY_NUMBER,
        type: "ltd",
        companyName: "Test Company"
      });
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app)
        .get(URL)
        .send({
          confirmationStatement: "true",
          lawfulActivityStatement: "true"
        });
      expect(response.status).toBe(200);
      expect(response.text).toContain(CONFIRMATION_STATEMENT_ECCT_TEXT);
      // expect(response.text).toContain(LAWFUL_ACTIVITY_STATEMENT_TEXT);
    });

    it("Should redirect to an error page when error is returned", async () => {
      mockGetConfirmationStatement.mockRejectedValueOnce(new Error());
      const response = await request(app)
        .get(URL);
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });

    it("Should show review page for Limited Partnership with confirmation and lawful activity statement checkboxes checked", async () => {

      setupLimitedPartnershipCompany();

      setExtraDataOnSession("true", "true");

      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);

      const response = await request(app).get(URL);

      expect(response.status).toBe(200);

      expect(response.text).toMatch(/govuk-checkboxes__input.*confirmation-statement.*\bchecked\b/);
      expect(response.text).toMatch(/govuk-checkboxes__input.*lawful-activity-statement.*\bchecked\b/);
    });

    it("Should show review page for Limited Partnership with confirmation and lawful activity statement checkboxes not checked", async () => {

      setupLimitedPartnershipCompany();

      setExtraDataOnSession("false", "false");

      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);

      const response = await request(app).get(URL);

      expect(response.status).toBe(200);

      const confirmationInputMatch = response.text.match(/<input[^>]+name="confirmationStatement"[^>]*>/);
      const lawfulInputMatch = response.text.match(/<input[^>]+name="lawfulActivityStatement"[^>]*>/);

      expect(confirmationInputMatch).not.toBeNull();
      expect(lawfulInputMatch).not.toBeNull();
    });

    it("Should show review page for Limited Partnership with confirmation and lawful activity statement checkboxe values not defined", async () => {

      setupLimitedPartnershipCompany();

      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);

      const response = await request(app).get(URL);

      expect(response.status).toBe(200);

      const confirmationInputMatch = response.text.match(/<input[^>]+name="confirmationStatement"[^>]*>/);
      const lawfulInputMatch = response.text.match(/<input[^>]+name="lawfulActivityStatement"[^>]*>/);

      expect(confirmationInputMatch).not.toBeNull();
      expect(lawfulInputMatch).not.toBeNull();
    });

    it("Should not show payment required text for Limited Partnership when payment is complete", async () => {

      setupLimitedPartnershipCompany();

      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);

      const response = await request(app).get(URL);

      expect(response.status).toBe(200);

      expect(response.text).toContain("Confirm and submit");

    });

    it("Should show payment required text for Limited Partnership when payment is required", async () => {

      setupLimitedPartnershipCompany();

      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);

      const response = await request(app).get(URL);

      expect(response.status).toBe(200);

      expect(response.text).toContain("Confirm and pay");
    });

    it("Should show scottish specific text and link for first checkbox", async () => {

      setupScottishLimitedPartnershipCompany();

      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);

      const response = await request(app).get(URL);

      expect(response.status).toBe(200);

      expect(response.text).toMatch(/regulation 35\(1\)\(a\) of the Scottish Partnerships \(Register of People with Significant Control\) Regulations 2017/);
    });


    it("Should show eng, wale, ni specific text and link for first checkbox", async () => {

      setupLimitedPartnershipCompany();

      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);

      const response = await request(app).get(URL);

      expect(response.status).toBe(200);

      expect(response.text).toMatch(/section 10D\(1\) and 10D\(2\) of the Limited Partnership Act 1907/);
    });


    function setExtraDataOnSession(confirmationChecked: string, lawfulActivityChecked: string) {

      mocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {

        if (!req.session) {
          req.session = new Session();
        }
        req.session.setExtraData(CONFIRMATION_STATEMENT_SESSION_KEY, confirmationChecked);
        req.session.setExtraData(LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY, lawfulActivityChecked);

        return next();
      });
    }
  });

  describe("post tests", () => {

    beforeEach(() => {
      jest.clearAllMocks();
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

    it("Should reload the review page with error messages when both confirmation & lawful activity statement checkboxes not ticked", async () => {
      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: "limited-partnership",
        subtype: "limited-partnership",
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app).post(URL).send();
      expect(response.status).toEqual(200);
      expect(response.text).toContain(ERROR_HEADING);
      expect(response.text).toContain(CONFIRMATION_STATEMENT_ERROR);
      expect(response.text).toContain(LAWFUL_ACTIVITY_STATEMENT_ERROR);
    });

    it("Should reload the review page with an error message when confirmation statement checkbox not ticked", async () => {
      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: "limited-partnership",
        subtype: "limited-partnership",
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app).post(URL).send({ lawfulActivityStatement: "true" });
      expect(response.status).toEqual(200);
      expect(response.text).toContain(ERROR_HEADING);
      expect(response.text).toContain(CONFIRMATION_STATEMENT_ERROR);
      expect(response.text).not.toContain(LAWFUL_ACTIVITY_STATEMENT_ERROR);
    });

    it("Should reload the review page with an error message when lawful activity statement checkbox not ticked", async () => {
      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
        subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";
      const response = await request(app).post(URL).send({ confirmationStatement: "true" });
      expect(response.status).toEqual(200);
      expect(response.text).toContain(ERROR_HEADING);
      expect(response.text).toContain(LAWFUL_ACTIVITY_STATEMENT_ERROR);
      expect(response.text).not.toContain(CONFIRMATION_STATEMENT_ERROR);
    });

    it("Should redirect to the LP confirmation url if the journey is LP and the payment is not due", async () => {
      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: "limited-partnership",
        subtype: "limited-partnership",
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";

      const response = await request(app).post(LP_URL).send({
        confirmationStatement: "true",
        lawfulActivityStatement: "true"
      });

      expect(response.status).toBe(302);
      expect(response.header.location).toEqual(LP_CONFIRMATION_URL);
    });

    it("Should redirect to the payment url if the journey is LP and the payment is due", async () => {
      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: "limited-partnership",
        subtype: "limited-partnership",
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);
      mockCloseTransaction.mockResolvedValueOnce(PAYMENT_URL);
      mockGetConfirmationStatement.mockResolvedValue(mockConfirmationStatementSubmission);
      mockStartPaymentsSession.mockResolvedValueOnce(dummyPaymentResponse);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2020-02-01";

      const response = await request(app).post(LP_URL).send({
        confirmationStatement: "true",
        lawfulActivityStatement: "true"
      });

      expect(response.status).toBe(302);
      expect(response.header.location).toEqual(PAYMENT_JOURNEY_URL);
    });
  });

  describe("Payment journey tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockStartPaymentsSession.mockReset();
      mockStartPaymentsSession.mockResolvedValue(dummyPaymentResponse);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);

    });

    it("Should redirect to the payment journey url", async () => {
      (getCompanyProfile as jest.Mock).mockResolvedValue({
        companyNumber: COMPANY_NUMBER,
        type: "ltd",
        companyName: "Test Company"
      });
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2026-06-28";
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionNoCosts);
      mockCloseTransaction.mockResolvedValueOnce(PAYMENT_URL);
      mockGetConfirmationStatement.mockResolvedValue(mockConfirmationStatementSubmission);
      mockStartPaymentsSession.mockResolvedValueOnce(dummyPaymentResponse);

      const response = await request(app)
        .post(URL)
        .send({
          confirmationStatement: "true",
          lawfulActivityStatement: "true"
        });

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(PAYMENT_JOURNEY_URL);
    });

    it("Should update the lawful purpose statement", async () => {
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2023-01-01";
      const companyProfile = { companyType: "ltd", confirmationStatement: { nextMadeUpTo: "2024-01-01" } };
      const transaction = { ...mockGetTransaction };
      const submission = { data: { confirmationStatementMadeUpToDate: "2023-12-01" } };

      mockGetCompanyProfile.mockResolvedValueOnce(companyProfile);
      mockGetTransaction.mockResolvedValueOnce(transaction);
      mockGetConfirmationStatement.mockResolvedValueOnce(submission);
      mockStartPaymentsSession.mockResolvedValueOnce({ resource: { links: { journey: "/payment-journey" } } });

      const response = await request(app)
        .post(URL)
        .send({
          confirmationStatement: "true",
          lawfulActivityStatement: "true"
        });

      expect(response.status).toBe(302);
    });

    it("Should show error page if payment response has no resource", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2026-06-28";
      mockCloseTransaction.mockResolvedValueOnce(PAYMENT_URL);
      mockStartPaymentsSession.mockResolvedValueOnce({ resource: { links: { journey: "/payment-journey" } } });

      const response = await request(app)
        .post(URL);

      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/payment-journey');
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

      const response = await request(app)
        .post(URL)
        .send({ confirmationStatement: "true", lawfulActivityStatement: "true" });

      expect(response.status).toEqual(302);
      expect(response.header.location).toBe(PAYMENT_JOURNEY_URL);
    });
  });

  describe("Back link test", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockGetConfirmationStatement.mockReset();
      mockGetConfirmationStatement.mockResolvedValue(mockConfirmationStatementSubmission);
      jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(true);
    });

    it("should redirect to Check SIC Code page when back button clicked, IS a Limited Partnership and NOT a private fund type", async () => {
      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
        subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);

      const response = await request(app)
        .get(URL);

      const backPath = LP_SIC_CODE_SUMMARY_PATH
        .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
        .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
        .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

      expect(response.text).toContain(backPath);
    });

    it("should redirect to Date page when back button clicked, IS a private fund Limited Partnership and NO date change", async () => {
      jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
        changeConfirmationStatementDate: false,
        beforeYouFileCheck: true,
        newConfirmationDate: null,
        confirmAllInformationCheck: false,
        confirmLawfulActionsCheck: false,
        sicCodes: []
      });

      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
        subtype: LIMITED_PARTNERSHIP_SUBTYPES.PFLP,
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);

      const response = await request(app)
        .get(URL);

      const backPath = LP_CS_DATE_PATH
        .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
        .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
        .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

      expect(response.text).toContain(backPath);
    });

    it("should redirect to Check Your Answer page when back button clicked, IS a private fund Limited Partnership and HAS a date change", async () => {
      jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
        changeConfirmationStatementDate: true,
        beforeYouFileCheck: true,
        newConfirmationDate: null,
        confirmAllInformationCheck: false,
        confirmLawfulActionsCheck: false,
        sicCodes: []
      });

      const mockLimitedPartnership = {
        companyNumber: COMPANY_NUMBER,
        type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
        subtype: LIMITED_PARTNERSHIP_SUBTYPES.PFLP,
        companyName: "Test Company"
      };
      mockGetCompanyProfile.mockResolvedValueOnce(mockLimitedPartnership);
      mockGetTransaction.mockResolvedValueOnce(dummyTransactionWithCosts);


      const response = await request(app)
        .get(URL);

      const backPath = LP_CHECK_YOUR_ANSWER_PATH
        .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
        .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
        .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

      expect(response.text).toContain(backPath);
    });

  });

  describe("getFormattedConfirmationDate", () => {
    it("formats newConfirmationDate when provided", () => {
      const date = new Date("2025-10-14");
      const result = getFormattedConfirmationDate(date, "2025-12-01");
      expect(result).toBe(moment(date).format(DMMMMYYYY_DATE_FORMAT));
    });

    it("falls back to nextMadeUpTo when newConfirmationDate is null", () => {
      const result = getFormattedConfirmationDate(null, "2025-12-01");
      expect(result).toBe(moment("2025-12-01").format(DMMMMYYYY_DATE_FORMAT));
    });

    it("falls back to nextMadeUpTo when newConfirmationDate is undefined", () => {
      const result = getFormattedConfirmationDate(undefined, "2025-12-01");
      expect(result).toBe(moment("2025-12-01").format(DMMMMYYYY_DATE_FORMAT));
    });

    it("returns undefined when both dates are missing", () => {
      const result = getFormattedConfirmationDate(undefined, undefined);
      expect(result).toBeUndefined();
    });

    it("handles string input for newConfirmationDate", () => {
      const result = getFormattedConfirmationDate("2025-10-14", "2025-12-01");
      expect(result).toBe(moment("2025-10-14").format(DMMMMYYYY_DATE_FORMAT));
    });
  });
});
