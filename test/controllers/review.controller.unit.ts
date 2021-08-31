jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/transaction.service");
jest.mock("../../src/services/confirmation.statement.service");

import { getTransaction } from "../../src/services/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import request from "supertest";
import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import { REVIEW_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetTransaction = getTransaction as jest.Mock;

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

describe("review controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
});
