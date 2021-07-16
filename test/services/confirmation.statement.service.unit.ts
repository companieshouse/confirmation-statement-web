jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import { getSessionRequest } from "../mocks/session.mock";
import { createConfirmationStatement }
  from "../../src/services/confirmation.statement.service";
import { ConfirmationStatementService }
  from "private-api-sdk-node/dist/services/confirmation-statement";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createPrivateApiClient } from "private-api-sdk-node";

const mockPostNewConfirmationStatement
    = ConfirmationStatementService.prototype.postNewConfirmationStatement as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

const transactionId = "12345";

describe ("Confirmation statement api service unit tests", () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  it ("should call create confirmation statement in the private sdk", async () => {
    mockPostNewConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 201
    });
    const response = await createConfirmationStatement(
      getSessionRequest({ access_token: "token" }), transactionId);
    expect(response.httpStatusCode).toEqual(201);
    expect(mockPostNewConfirmationStatement).toBeCalledWith(transactionId);
  });

  it ("should call create confirmation statement in the private sdk (failed eligibility)", async () => {
    mockPostNewConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 400
    });
    const response = await createConfirmationStatement(
      getSessionRequest({ access_token: "token" }), transactionId);
    expect(response.httpStatusCode).toEqual(400);
    expect(mockPostNewConfirmationStatement).toBeCalledWith(transactionId);
  });

  it ("should throw error when failed post call", async () => {
    mockPostNewConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 500
    });
    createConfirmationStatement(
      getSessionRequest({ access_token: "token" }), transactionId).then(fail("Expecting error to be thrown")).catch(e=>{
        expect(e.message).toEqual("Something went wrong creating confirmation statement ")
    });
    expect(mockPostNewConfirmationStatement).toBeCalledWith(transactionId);
  });
});
