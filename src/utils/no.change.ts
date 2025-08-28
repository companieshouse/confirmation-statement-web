import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getCompanyProfile } from "../services/company.profile.service";
import { getConfirmationStatement } from "../services/confirmation.statement.service";
import { TASK_LIST_PATH } from "../types/page.urls";
import { CONFIRMATION_STATEMENT_ERROR, LAWFUL_ACTIVITY_STATEMENT_ERROR } from "./constants";
import { toReadableFormat } from "./date";
import { ecctDayOneEnabled } from "./feature.flag";
import { urlUtils } from "./url";
import { isStatementCheckboxTicked } from "./check.box.ticked";
import { Session } from "@companieshouse/node-session-handler";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

export function handleNoChangeConfirmationJourney(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, 
    res: Response<any, Record<string, any>>, company: CompanyProfile, companyNumber: string, transactionId: string, 
    submissionId: string, csSubmission: ConfirmationStatementSubmission, session: Session) {

  const statementDate: Date = new Date(
    company.confirmationStatement?.nextMadeUpTo as string
  );
  const ecctEnabled: boolean = ecctDayOneEnabled(statementDate);

  if (ecctEnabled) {
    const confirmationCheckboxValue = req.body.confirmationStatement;
    const lawfulActivityCheckboxValue = req.body.lawfulActivityStatement;

    const confirmationValid = isStatementCheckboxTicked(
      confirmationCheckboxValue
    );
    const lawfulActivityValid = isStatementCheckboxTicked(
      lawfulActivityCheckboxValue
    );

    let confirmationStatementError: string = "";
    if (!confirmationValid) {
      confirmationStatementError = CONFIRMATION_STATEMENT_ERROR;
    }

    let lawfulActivityStatementError: string = "";
    if (!lawfulActivityValid) {
      lawfulActivityStatementError = LAWFUL_ACTIVITY_STATEMENT_ERROR;
    }

    if (!confirmationValid || !lawfulActivityValid) {
      return {
        renderData: {
          backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
          company,
          nextMadeUpToDate: toReadableFormat(
            csSubmission.data?.confirmationStatementMadeUpToDate
          ),
          ecctEnabled,
          confirmationStatementError,
          lawfulActivityStatementError
        }
      };

    }
  }

}
