jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/utils/logger");

import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "../../src/services/api.service";
import { postTransaction, putTransaction } from "../../src/services/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError } from "../../src/utils/logger";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();
const mockPutTransaction = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreatePublicOAuthApiClient.mockReturnValue({
  transaction: {
    postTransaction: mockPostTransaction,
    putTransaction: mockPutTransaction
  }
});

let session: any;


describe("transaction service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("postTransaction tests", () => {
    it("Should successfully post a transaction", async() => {
      mockPostTransaction.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          reference: "ref",
          companyNumber: "12345678",
          description: "desc"
        }
      });
      const transaction: Transaction = await postTransaction(session, "12345678", "desc", "ref");

      expect(transaction.reference).toEqual("ref");
      expect(transaction.companyNumber).toEqual("12345678");
      expect(transaction.description).toEqual("desc");
    });

    it("Should throw an error when no transaction api response", async () => {
      mockPostTransaction.mockResolvedValueOnce(undefined);
      const error: Error = new Error("oops");
      mockCreateAndLogError.mockReturnValueOnce(error);

      await expect(postTransaction(session, "12345678", "desc", "ref")).rejects.toThrow(error);
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API POST request returned no response for company number 12345678");
    });

    it("Should throw an error when transaction api returns a status greater than 400", async () => {
      mockPostTransaction.mockReturnValue({
        httpStatusCode: 404
      });

      const error: Error = new Error("oops");
      mockCreateAndLogError.mockReturnValueOnce(error);

      await expect(postTransaction(session, "12345678", "desc", "ref")).rejects.toThrow(error);
      expect(mockCreateAndLogError).toBeCalledWith("Http status code 404 - Failed to post transaction for company number 12345678");
    });

    it("Should throw an error when transaction api returns no resource", async () => {
      mockPostTransaction.mockReturnValue({
        httpStatusCode: 200
      });

      const error: Error = new Error("oops");
      mockCreateAndLogError.mockReturnValueOnce(error);

      await expect(postTransaction(session, "12345678", "desc", "ref")).rejects.toThrow(error);
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API POST request returned no resource for company number 12345678");
    });
  });


  describe("putTransaction tests", () => {
    it("Should successfully PUT a transaction", async () => {
      mockPutTransaction.mockReturnValue({
        headers: {
          "X-Payment-Required": "http://payment"
        },
        httpStatusCode: 200,
        resource: {
          reference: "ref",
          companyNumber: "12345678",
          description: "desc"
        }
      } as ApiResponse<Transaction>);
      const transaction: ApiResponse<Transaction> = await putTransaction(session, "12345678", "2222", "desc", "ref", "closed");

      expect(transaction.resource?.reference).toEqual("ref");
      expect(transaction.resource?.companyNumber).toEqual("12345678");
      expect(transaction.resource?.description).toEqual("desc");
    });
  });
});
