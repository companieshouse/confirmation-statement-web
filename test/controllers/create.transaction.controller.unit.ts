jest.mock("../../src/services/transaction.service");
jest.mock("../../src/services/confirmation.statement.service");

import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import mocks from "../mocks/all.middleware.mock";
import { createConfirmationStatement } from "../../src/services/confirmation.statement.service";
import { postTransaction } from "../../src/services/transaction.service";
import request from "supertest";
import app from "../../src/app";
import { CREATE_TRANSACTION_PATH } from '../../src/types/page.urls';
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";


const mockPostTransaction = postTransaction as jest.Mock;
const mockCreateConfirmationStatement = createConfirmationStatement as jest.Mock;

const PAGE_HEADING = "Found. Redirecting to /confirmation-statement/company/12345678/transaction/1234/submission/87654321/trading-status";
const COMPANY_NUMBER = "12345678";
const ERROR_PAGE_TEXT = "Service offline - File a confirmation statement";
const TRANSACTION_ID = "1234";
const LIMITED_PARTNERSHIP_URL = "/confirmation-statement/limited-partnership/before-you-file?lang=en";
const TRADING_STATUS_URL = "/confirmation-statement/company/12345678/transaction/1234/submission/87654321/trading-status";

const dummyTransaction = {
  id: TRANSACTION_ID
} as Transaction;

describe("create transaction controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to trading status page", async () => {
    const url = CREATE_TRANSACTION_PATH.replace(":companyNumber", COMPANY_NUMBER);
    mockPostTransaction.mockResolvedValueOnce(dummyTransaction);
    mockCreateConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 201,
      resource: {
        id: "87654321"
      }
    });
    const response = await request(app)
      .get(url);

    expect(response.status).toBe(302);
    expect(mockPostTransaction).toBeCalledTimes(1);
    expect(mockCreateConfirmationStatement).toBeCalledTimes(1);
    expect(mockCreateConfirmationStatement.mock.calls[0][1]).toEqual(TRANSACTION_ID);
    expect(response.text).toContain(PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should throw a company not eligible error", async () => {
    const url = CREATE_TRANSACTION_PATH.replace(":companyNumber", COMPANY_NUMBER);
    mockPostTransaction.mockResolvedValueOnce(dummyTransaction);
    mockCreateConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 400
    });
    const response = await request(app)
      .get(url);

    expect(response.status).toBe(500);
    expect(mockPostTransaction).toBeCalledTimes(1);
    expect(mockCreateConfirmationStatement).toBeCalledTimes(1);
    expect(mockCreateConfirmationStatement.mock.calls[0][1]).toEqual(TRANSACTION_ID);
    expect(response.text).toContain(ERROR_PAGE_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should show error page if error is thrown", async () => {
    const url = CREATE_TRANSACTION_PATH.replace(":companyNumber", COMPANY_NUMBER);
    mockPostTransaction.mockRejectedValueOnce(new Error("Internal error"));

    const response = await request(app)
      .get(url);

    expect(response.status).toBe(500);
    expect(response.text).toContain(ERROR_PAGE_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should redirect to limited partnership journey if company type is LP and contain ACSP number", async () => {
    const url = CREATE_TRANSACTION_PATH.replace(":companyNumber", COMPANY_NUMBER);
    setPostTransactionAndCreateConfirmationStatement();
    setCompanyTypeAndAcspNumberInSession("limited-partnership", "123456");

    const response = await request(app).get(url);

    expect(response.header.location).toEqual(LIMITED_PARTNERSHIP_URL);
  });

  it("should redirect to trading status page if company type is not LP and contain ACSP number", async () => {
    const url = CREATE_TRANSACTION_PATH.replace(":companyNumber", COMPANY_NUMBER);
    setPostTransactionAndCreateConfirmationStatement();
    setCompanyTypeAndAcspNumberInSession("ltd", "123456");

    const response = await request(app).get(url);

    expect(response.header.location).toEqual(TRADING_STATUS_URL);
  });

  it("should redirect to trading status page if session do not contain company type and ACSP number", async () => {
    const url = CREATE_TRANSACTION_PATH.replace(":companyNumber", COMPANY_NUMBER);
    setPostTransactionAndCreateConfirmationStatement();
    setCompanyTypeAndAcspNumberInSession("", "");

    const response = await request(app).get(url);

    expect(response.header.location).toEqual(TRADING_STATUS_URL);
  });
});

function setPostTransactionAndCreateConfirmationStatement() {
  mockPostTransaction.mockResolvedValueOnce(dummyTransaction);
  mockCreateConfirmationStatement.mockResolvedValueOnce({
    httpStatusCode: 201,
    resource: {
      id: "87654321"
    }
  });
}

function setCompanyTypeAndAcspNumberInSession(companyType: string, acspNumber: string) {
  mocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        acsp_number: acspNumber
      },
      extra_data: {
        company_profile: {
          type: companyType
        }
      }
    };
    req.session = session;
    return next();
  });
}
