jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/utils/logger");

import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "../../src/services/api.service";
import { postTransaction } from "../../src/services/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError } from "../../src/utils/logger";

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreatePublicOAuthApiClient.mockReturnValue({
  transaction: {
    postTransaction: mockPostTransaction
  }
});

let session;


describe ("transaction service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  it ("Should successfully post a transaction", async() => {
    mockPostTransaction.mockReturnValue({
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

  it ("Should throw an error when no transaction api response", () => {
    mockPostTransaction.mockReturnValue(undefined);

    postTransaction(session, "12345678", "desc", "ref").then(() => {fail();}).catch(() => {
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API returned no response for company number 12345678");
    });
  });

  it ("Should throw an error when transaction api returns a status greater than 400", () => {
    mockPostTransaction.mockReturnValue({
      httpStatusCode: 404
    });

    postTransaction(session, "12345678", "desc", "ref").then(() => {fail();}).catch(() => {
      expect(mockCreateAndLogError).toBeCalledWith("Http status code 404 - Failed to post transaction for company number 12345678");
    });
  });

  it ("Should throw an error when transaction api returns no resource", () => {
    mockPostTransaction.mockReturnValue({
      httpStatusCode: 200
    });

    postTransaction(session, "12345678", "desc", "ref").then(() => {fail();}).catch(() => {
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API returned no resource for company number 12345678");
    });
  });
});
