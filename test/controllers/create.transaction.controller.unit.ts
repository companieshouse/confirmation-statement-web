jest.mock("../../src/services/transaction.service");

import mocks from "../mocks/all.middleware.mock";
import { postTransaction } from "../../src/services/transaction.service";
import request from "supertest";
import app from "../../src/app";
import { CREATE_TRANSACTION_PATH } from "../../src/types/page.urls";


const mockPostTransaction = postTransaction as jest.Mock;

const PAGE_HEADING = "Found. Redirecting to /confirmation-statement/company/12345678/trading-status";
const COMPANY_NUMBER = "12345678";
const ERROR_PAGE_TEXT = "Service offline - File a confirmation statement";


describe("create transaction controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to trading status page", async () => {
    const url = CREATE_TRANSACTION_PATH.replace(":companyNumber", COMPANY_NUMBER);
    const response = await request(app)
      .get(url);

    expect(response.status).toBe(302);
    expect(mockPostTransaction).toBeCalledTimes(1);
    expect(response.text).toContain(PAGE_HEADING);
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
});
