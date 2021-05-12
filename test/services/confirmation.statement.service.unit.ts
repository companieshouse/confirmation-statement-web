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

const transactionId = "12345";

describe ("Confirmation statement api service unit tests", () => {

  beforeEach (() => {
    mockCreatePrivateApiClient.mockReturnValue({
      confirmationStatementService: ConfirmationStatementService.prototype
    } as PrivateApiClient
    );
  });

  it ("should create confirmation statement is called in the private sdk", async () => {
    mockPostNewConfirmationStatement.mockResolvedValueOnce(201);
    const response = await createConfirmationStatement(getSessionRequest(), transactionId);
    expect(response).toEqual(201);
    expect(mockPostNewConfirmationStatement).toBeCalledWith(transactionId);
  });
});
