jest.mock("@companieshouse/api-sdk-node");
jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import {
  ConfirmationStatementService,
  PersonOfSignificantControl,
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { createPrivateApiClient } from "private-api-sdk-node";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  mockCompanyPscStatementResource,
  mockPersonsOfSignificantControl
} from "../mocks/person.of.significant.control.mock";
import { getPscs, getCompanyPscStatements, getMostRecentActivePscStatement } from "../../src/services/psc.service";
import { CompanyPersonsWithSignificantControlStatements, CompanyPersonWithSignificantControlStatement } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements";

const mockGetPersonsOfSignificantControl = ConfirmationStatementService.prototype.getPersonsOfSignificantControl as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyPscStatements = jest.fn();
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: ConfirmationStatementService.prototype
} as PrivateApiClient);

mockCreateApiClient.mockReturnValue({
  companyPscStatements: {
    getCompanyPscStatements: mockGetCompanyPscStatements
  }
});

const session = getSessionRequest({ access_token: "token" });
const companyNumber = "11111111";

describe("Test psc service", () => {


  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPscs tests", () => {
    it("should call sdk to get psc data", async () => {
      const resource: Resource<PersonOfSignificantControl[]> = {
        httpStatusCode: 200,
        resource: mockPersonsOfSignificantControl
      };
      mockGetPersonsOfSignificantControl.mockResolvedValueOnce(resource);
      const response = await getPscs(session, companyNumber);
      expect(mockGetPersonsOfSignificantControl).toBeCalledWith(companyNumber);
      expect(response).toEqual(mockPersonsOfSignificantControl);
    });

    it("should throw error when http error code is returned", async () => {
      const errorMessage = "Oh no this has failed";
      const errorResponse: ApiErrorResponse = {
        httpStatusCode: 404,
        errors: [{ error: errorMessage }]
      };
      mockGetPersonsOfSignificantControl.mockResolvedValueOnce(errorResponse);
      const expectedMessage = "Error retrieving pscs from confirmation-statement-api " + JSON.stringify(errorResponse);
      let actualMessage: any;
      try {
        await getPscs(session, companyNumber);
      } catch (e) {
        actualMessage = e.message;
      }
      expect(actualMessage).toBeTruthy();
      expect(actualMessage).toEqual(expectedMessage);
    });
  });

  describe("getCompanyPscStatements tests", () => {
    it("should call sdk to get psc statements", async () => {
      const resource: Resource<CompanyPersonsWithSignificantControlStatements> = {
        httpStatusCode: 200,
        resource: mockCompanyPscStatementResource
      };

      mockGetCompanyPscStatements.mockResolvedValueOnce(resource);
      const response = await getCompanyPscStatements(session, companyNumber, 25, 0);
      expect(mockGetCompanyPscStatements).toBeCalledWith(companyNumber, 25, 0);
      expect(response).toEqual(mockCompanyPscStatementResource);
    });

    it("should throw error when http error code is returned for statement request", async () => {
      const errorMessage = "Oh no this has failed";
      const errorResponse: ApiErrorResponse = {
        httpStatusCode: 401,
        errors: [{ error: errorMessage }]
      };
      mockGetCompanyPscStatements.mockResolvedValueOnce(errorResponse);
      const expectedMessage = "Error retrieving psc statement from psc statement api " + JSON.stringify(errorResponse);
      let actualMessage: any;
      try {
        await getCompanyPscStatements(session, companyNumber, 25, 0);
      } catch (e) {
        actualMessage = e.message;
      }
      expect(actualMessage).toBeTruthy();
      expect(actualMessage).toEqual(expectedMessage);
    });

    it("should return empty reult object when 404 is returned for statement request", async () => {
      const errorResponse: ApiErrorResponse = {
        httpStatusCode: 404,
        errors: [{ error: "Resource Not Found" }]
      };
      mockGetCompanyPscStatements.mockResolvedValueOnce(errorResponse);
      const pscStatement = await getCompanyPscStatements(session, companyNumber, 25, 0);

      expect(pscStatement).toStrictEqual({
        activeCount: "0",
        ceasedCount: "0",
        items: [],
        links: {
          self: "",
        },
        totalResults: "0"
      });
    });
  });

  describe("getMostRecentActivePscStatement tests", () => {
    it("should return the most recent active psc statement", async () => {
      const resource: Resource<CompanyPersonsWithSignificantControlStatements> = {
        httpStatusCode: 200,
        resource: mockCompanyPscStatementResource
      };
      mockGetCompanyPscStatements.mockResolvedValueOnce(resource);
      const pscStatement: CompanyPersonWithSignificantControlStatement = await getMostRecentActivePscStatement(session, companyNumber);

      expect(pscStatement.statement).toBe("STATEMENT7");
    });

    it("should return undefined if no psc statements found", async () => {
      const errorResponse: ApiErrorResponse = {
        httpStatusCode: 404,
        errors: [{ error: "Resource Not Found" }]
      };
      mockGetCompanyPscStatements.mockResolvedValueOnce(errorResponse);
      const pscStatement: CompanyPersonWithSignificantControlStatement = await getMostRecentActivePscStatement(session, companyNumber);

      expect(pscStatement).toBeUndefined();
    });
  });

});
