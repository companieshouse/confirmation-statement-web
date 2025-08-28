import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { TASK_LIST_PATH } from "../../types/page.urls";
import { isCheckboxTicked } from "./check.box";
import { CONFIRMATION_STATEMENT_ERROR, LAWFUL_ACTIVITY_STATEMENT_ERROR } from "../../utils/constants";
import { toReadableFormat } from "../../utils/date";
import { ecctDayOneEnabled } from "../../utils/feature.flag";
import { urlUtils } from "../../utils/url";

export function handleNoChangeConfirmationJourney(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  company: CompanyProfile, csSubmission: ConfirmationStatementSubmission) {

  const statementDate: Date = new Date(
    company.confirmationStatement?.nextMadeUpTo as string
  );
  const ecctEnabled: boolean = ecctDayOneEnabled(statementDate);

  if (ecctEnabled) {
    const confirmationCheckboxValue = req.body.confirmationStatement;
    const lawfulActivityCheckboxValue = req.body.lawfulActivityStatement;

    const confirmationValid = isCheckboxTicked(
      confirmationCheckboxValue
    );
    const lawfulActivityValid = isCheckboxTicked(
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
