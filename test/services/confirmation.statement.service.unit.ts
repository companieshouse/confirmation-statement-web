jest.mock("../../src/utils/logger");
jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/confirmation-statement");

import { getSessionRequest } from "../mocks/session.mock";
import {
  createConfirmationStatement,
  getConfirmationStatement, getNextMadeUpToDate, updateConfirmationStatement
}
  from "../../src/services/confirmation.statement.service";
import {
  ConfirmationStatementService,
  ConfirmationStatementSubmission, NextMadeUpToDate
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { createApiClient } from "@companieshouse/api-sdk-node";
import { mockConfirmationStatementSubmission } from "../mocks/confirmation.statement.submission.mock";
import { Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../src/utils/logger";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

const mockPostNewConfirmationStatement
    = ConfirmationStatementService.prototype.postNewConfirmationStatement as jest.Mock;
const mockPostUpdateConfirmationStatement
    = ConfirmationStatementService.prototype.postUpdateConfirmationStatement as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetConfirmationStatementSubmission
    = ConfirmationStatementService.prototype.getConfirmationStatementSubmission as jest.Mock;
const mockGetNextMadeUpToDate = ConfirmationStatementService.prototype.getNextMadeUpToDate as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;

const ERROR: Error = new Error("oops");
mockCreateAndLogError.mockReturnValue(ERROR);

mockCreateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as ApiClient);

const TRANSACTION_ID = "12345";
const SUBMISSION_ID = "14566";
const TRANSACTION_ID_WITH_SPECIAL_CHARACTERS = "12{}345";
const SUBMISSION_ID_WITH_SPECIAL_CHARACTERS = "14{}566";
const ENCODED_TRANSACTION_ID_WITH_SPECIAL_CHARACTERS = "12%7B%7D345";
const ENCODED_SUBMISSION_ID_WITH_SPECIAL_CHARACTERS = "14%7B%7D566";
const COMPANY_NUMBER = "26331212";

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
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID, SUBMISSION_ID);

      expect(mockGetConfirmationStatementSubmission).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
      expect(response).toBe(mockConfirmationStatementSubmission);
    });

    it ("should throw error when http status is not 200", async () => {
      mockGetConfirmationStatementSubmission.mockResolvedValueOnce({
        httpStatusCode: 500
      });

      await getConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID, SUBMISSION_ID)
        .then(() => {
          fail("Expecting error to be thrown");
        }).catch(e => {
          expect(e.message).toContain("Error getting confirmation statement from api");
          expect(e.message).toContain(SUBMISSION_ID);
          expect(e.message).toContain(TRANSACTION_ID);
        });
    });

    it ("should throw error with any special characters encoded when http status is not 200", async () => {
      mockGetConfirmationStatementSubmission.mockResolvedValueOnce({
        httpStatusCode: 500
      });

      await getConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID_WITH_SPECIAL_CHARACTERS, SUBMISSION_ID_WITH_SPECIAL_CHARACTERS)
        .then(() => {
          fail("Expecting error to be thrown");
        }).catch(e => {
          expect(e.message).toContain("Error getting confirmation statement from api");
          expect(e.message).toContain(ENCODED_SUBMISSION_ID_WITH_SPECIAL_CHARACTERS);
          expect(e.message).toContain(ENCODED_TRANSACTION_ID_WITH_SPECIAL_CHARACTERS);
        });
    });

    it ("should throw error when response is not an error and has no resource", async () => {
      mockGetConfirmationStatementSubmission.mockResolvedValueOnce({
        httpStatusCode: 200
      });

      await getConfirmationStatement(
        getSessionRequest({ access_token: "token" }), TRANSACTION_ID, SUBMISSION_ID)
        .then(() => {
          fail("Expecting error to be thrown");
        }).catch(e => {
          expect(e.message).toContain("Error No resource returned when getting confirmation statement");
          expect(e.message).toContain(SUBMISSION_ID);
          expect(e.message).toContain(TRANSACTION_ID);
        });
    });
  });
});

describe ("updateConfirmationStatement unit tests", () => {
  it("should call update confirmation statement in the private sdk", async () => {
    mockPostUpdateConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 200
    });
    const csSubmission: ConfirmationStatementSubmission = mockConfirmationStatementSubmission;
    await updateConfirmationStatement(
      getSessionRequest({ access_token: "token" }), TRANSACTION_ID, SUBMISSION_ID, csSubmission);
    expect(mockPostUpdateConfirmationStatement).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID, csSubmission);
  });

  it("should should throw error when not found", async () => {
    mockPostUpdateConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 404
    });
    const csSubmission: ConfirmationStatementSubmission = mockConfirmationStatementSubmission;
    await updateConfirmationStatement(
      getSessionRequest({ access_token: "token" }), TRANSACTION_ID, SUBMISSION_ID, csSubmission)
      .then(() => {
        fail("Expecting error to be thrown");
      }).catch(e => {
        expect(e.message).toContain("Something went wrong updating confirmation statement");
        expect(e.message).toContain("404");
      });

    expect(mockPostUpdateConfirmationStatement).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID, csSubmission);
  });

  it("should should throw error when other http code is returned", async () => {
    mockPostUpdateConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 500
    });
    const csSubmission: ConfirmationStatementSubmission = mockConfirmationStatementSubmission;
    await updateConfirmationStatement(
      getSessionRequest({ access_token: "token" }), TRANSACTION_ID, SUBMISSION_ID, csSubmission)
      .then(() => {
        fail("Expecting error to be thrown");
      }).catch(e => {
        expect(e.message).toContain("Something went wrong updating confirmation statement");
        expect(e.message).toContain("500");
      });

    expect(mockPostUpdateConfirmationStatement).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID, csSubmission);
  });

  it("should should throw error with any special characters encoded when other http code is returned", async () => {
    mockPostUpdateConfirmationStatement.mockResolvedValueOnce({
      httpStatusCode: 500
    });
    const csSubmission: ConfirmationStatementSubmission = mockConfirmationStatementSubmission;
    await updateConfirmationStatement(
      getSessionRequest({ access_token: "token" }), TRANSACTION_ID_WITH_SPECIAL_CHARACTERS, SUBMISSION_ID_WITH_SPECIAL_CHARACTERS, csSubmission)
      .then(() => {
        fail("Expecting error to be thrown");
      }).catch(e => {
        expect(e.message).toContain("Something went wrong updating confirmation statement");
        expect(e.message).toContain("500");
        expect(e.message).toContain(ENCODED_SUBMISSION_ID_WITH_SPECIAL_CHARACTERS);
        expect(e.message).toContain(ENCODED_TRANSACTION_ID_WITH_SPECIAL_CHARACTERS);
      });

    expect(mockPostUpdateConfirmationStatement).toBeCalledWith(TRANSACTION_ID_WITH_SPECIAL_CHARACTERS, SUBMISSION_ID_WITH_SPECIAL_CHARACTERS, csSubmission);
  });
});

describe("getNextMadeUpToDate tests", () => {

  const CURRENT_NEXT_MADE_UP_TO = "2021-05-23";
  const NEW_NEXT_MADE_UP_TO = "2021-04-12";

  it("Should call SDK to get next made up to date", async () => {
    mockGetNextMadeUpToDate.mockResolvedValueOnce({
      httpStatusCode: 200,
      resource: {
        currentNextMadeUpToDate: CURRENT_NEXT_MADE_UP_TO,
        isDue: false,
        newNextMadeUpToDate: NEW_NEXT_MADE_UP_TO
      } as NextMadeUpToDate
    } as Resource<NextMadeUpToDate>);

    const nextMadeUpToDate: NextMadeUpToDate = await getNextMadeUpToDate(getSessionRequest({ access_token: "token" }), COMPANY_NUMBER);

    expect(nextMadeUpToDate.currentNextMadeUpToDate).toBe(CURRENT_NEXT_MADE_UP_TO);
    expect(nextMadeUpToDate.isDue).toBe(false);
    expect(nextMadeUpToDate.newNextMadeUpToDate).toBe(NEW_NEXT_MADE_UP_TO);
  });

  it("Should throw an error if status code != 200", async () => {
    mockGetNextMadeUpToDate.mockResolvedValueOnce({
      httpStatusCode: 404
    } as Resource<NextMadeUpToDate>);

    await expect(getNextMadeUpToDate(getSessionRequest({ access_token: "token" }), COMPANY_NUMBER))
      .rejects
      .toThrow(ERROR);

    expect(mockCreateAndLogError).toBeCalledWith(
      expect.stringContaining(`Error getting next made up to date from api with company number = ${COMPANY_NUMBER}`));
  });

  it("Should throw an error if no resource returned when status 200", async () => {
    mockGetNextMadeUpToDate.mockResolvedValueOnce({
      httpStatusCode: 200
    } as Resource<NextMadeUpToDate>);

    await expect(getNextMadeUpToDate(getSessionRequest({ access_token: "token" }), COMPANY_NUMBER))
      .rejects
      .toThrow(ERROR);

    expect(mockCreateAndLogError).toBeCalledWith(
      expect.stringContaining(`Error No resource returned when getting next made up to date from api with companyNumber = ${COMPANY_NUMBER}`));
  });
});
