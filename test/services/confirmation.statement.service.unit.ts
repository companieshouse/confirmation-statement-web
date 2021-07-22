jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import { getSessionRequest } from "../mocks/session.mock";
import {
  createConfirmationStatement,
  getConfirmationStatement }
  from "../../src/services/confirmation.statement.service";
import { ConfirmationStatementService }
  from "private-api-sdk-node/dist/services/confirmation-statement";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createPrivateApiClient } from "private-api-sdk-node";
import { mockConfirmationStatementSubmission } from "../mocks/confirmation.statement.submission.mock";

const mockPostNewConfirmationStatement
    = ConfirmationStatementService.prototype.postNewConfirmationStatement as jest.Mock;

const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

const mockGetConfirmationStatementSubmission
    = ConfirmationStatementService.prototype.getConfirmationStatementSubmission as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

const TRANSACTION_ID = "12345";
const CONFIRMATION_STATEMENT_ID = "14566";

describe ("Confirmation statement api service unit tests", () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe ("createConfirmationStatement unit tests", () => {
    it ("should call create confirmation statement in the private sdk", async () => {
      mockPostNewConfirmationStatement.mockResolvedValueOnce({
        httpStatusCode: 201
      });
      const response = await createConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID);
      expect(response.httpStatusCode).toEqual(201);
      expect(mockPostNewConfirmationStatement).toBeCalledWith(TRANSACTION_ID);
    });

    it ("should call create confirmation statement in the private sdk (failed eligibility)", async () => {
      mockPostNewConfirmationStatement.mockResolvedValueOnce({
        httpStatusCode: 400
      });
      const response = await createConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID);
      expect(response.httpStatusCode).toEqual(400);
      expect(mockPostNewConfirmationStatement).toBeCalledWith(TRANSACTION_ID);
    });

    it ("should throw error when failed post call", async () => {
      mockPostNewConfirmationStatement.mockResolvedValueOnce({
        httpStatusCode: 500
      });
      await createConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID)
        .then(() => {
          fail("Expecting error to be thrown");
        }).catch(e => {
          expect(e.message).toContain("Something went wrong creating confirmation statement");
          expect(e.message).toContain(TRANSACTION_ID);
        });
      expect(mockPostNewConfirmationStatement).toBeCalledWith(TRANSACTION_ID);
    });
  });

  describe ("getConfirmationStatement unit tests", () => {
    it ("should return a confirmation statement", async () => {
      mockGetConfirmationStatementSubmission.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: mockConfirmationStatementSubmission
      });

      const response = await getConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID, CONFIRMATION_STATEMENT_ID);

      expect(mockGetConfirmationStatementSubmission).toBeCalledWith(TRANSACTION_ID, CONFIRMATION_STATEMENT_ID);
      expect(response).toBe(mockConfirmationStatementSubmission);
    });

    it ("should throw error when http status is not 200", async () => {
      mockGetConfirmationStatementSubmission.mockResolvedValueOnce({
        httpStatusCode: 500
      });

      await getConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID, CONFIRMATION_STATEMENT_ID)
        .then(() => {
          fail("Expecting error to be thrown");
        }).catch(e => {
          expect(e.message).toContain("Error getting confirmation statement from api");
          expect(e.message).toContain(CONFIRMATION_STATEMENT_ID);
          expect(e.message).toContain(TRANSACTION_ID);
        });
    });

    it ("should throw error when response is not an error and has no resource", async () => {
      mockGetConfirmationStatementSubmission.mockResolvedValueOnce({
        httpStatusCode: 200
      });

      await getConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID, CONFIRMATION_STATEMENT_ID)
        .then(() => {
          fail("Expecting error to be thrown");
        }).catch(e => {
          expect(e.message).toContain("Error No resource returned when getting confirmation statement");
          expect(e.message).toContain(CONFIRMATION_STATEMENT_ID);
          expect(e.message).toContain(TRANSACTION_ID);
        });
    });
  });
});
