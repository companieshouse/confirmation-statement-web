import { createPrivateOAuthApiClient, createPublicOAuthApiClient } from "./api.service";
import { ConfirmationStatementService, PersonOfSignificantControl } from "private-api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { CompanyPersonsWithSignificantControlStatements, CompanyPersonWithSignificantControlStatement } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements";
import { DateTime } from "luxon";
import { logger } from "../utils/logger";

export const getPscs = async (session: Session, companyNumber: string): Promise<PersonOfSignificantControl[]> => {
  const client = createPrivateOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<PersonOfSignificantControl[]> | ApiErrorResponse = await csService.getPersonsOfSignificantControl(companyNumber);
  const status = response.httpStatusCode as number;
  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error("Error retrieving pscs from confirmation-statement-api " + JSON.stringify(errorResponse));
  }
  const successfulResponse = response as Resource<PersonOfSignificantControl[]>;
  return successfulResponse.resource as PersonOfSignificantControl[];
};

export const getPscStatements = async (session: Session, companyNumber: string, pageSize: number, pageIndex: number): Promise<CompanyPersonsWithSignificantControlStatements> => {
  const client = createPublicOAuthApiClient(session);
  logger.info(`Calling SDK getCompanyPscStatements with pageSize = ${pageSize}, pageIndex = ${pageIndex}`);

  const response: Resource<CompanyPersonsWithSignificantControlStatements> | ApiErrorResponse =
    await client.companyPscStatements.getCompanyPscStatements(companyNumber, pageSize, pageIndex);

  if (response.httpStatusCode === 404) {
    logger.info(`psc.service getCompanyPscStatements received 404 for company number ${companyNumber}. Returning empty result.`);
    return {
      activeCount: "0",
      ceasedCount: "0",
      items: [],
      links: {
        self: "",
      },
      totalResults: "0"
    } as CompanyPersonsWithSignificantControlStatements;
  }
  if (!response.httpStatusCode || response.httpStatusCode >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error("Error retrieving psc statement from psc statement api " + JSON.stringify(errorResponse));
  }

  const successfulResponse = response as Resource<CompanyPersonsWithSignificantControlStatements>;
  return successfulResponse.resource as CompanyPersonsWithSignificantControlStatements;
};

export const getMostRecentActivePscStatement = async (session: Session, companyNumber: string): Promise<CompanyPersonWithSignificantControlStatement> => {
  const pageSize = 100;
  const pscStatements: CompanyPersonsWithSignificantControlStatements = await getPscStatements(session, companyNumber, pageSize, 0);

  logger.info(`Extracting most recent active PSC statement from ${pscStatements?.totalResults} returned items`);
  return pscStatements.items
    .filter(statement => !statement.ceasedOn)
    .sort((statement1, statement2) => DateTime.fromISO(statement2.notifiedOn).toMillis() - DateTime.fromISO(statement1.notifiedOn).toMillis())
    .shift() as CompanyPersonWithSignificantControlStatement;
};
