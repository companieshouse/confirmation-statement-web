import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { isStatementCheckboxTicked } from "../../utils/check.box.ticked";
import { LP_CONFIRMATION_STATEMENT_ERROR, LP_LAWFUL_ACTIVITY_STATEMENT_ERROR } from "../../utils/constants";
import { getACSPBackPath, isACSPJourney, getConfirmationPath } from "../../utils/limited.partnership";
import { selectLang, getLocalesService } from "../../utils/localise";
import { urlUtils } from "../../utils/url";

export function handleLimitedPartnershipConfirmationJourney (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  companyNumber: string, companyProfile: CompanyProfile, transactionId: string, submissionId: string, session: Session) {

  const confirmationCheckboxValue = req.body.confirmationStatement;
  const lawfulActivityCheckboxValue = req.body.lawfulActivityStatement;

  const confirmationValid = isStatementCheckboxTicked(
    confirmationCheckboxValue
  );

  const lawfulActivityValid = isStatementCheckboxTicked(
    lawfulActivityCheckboxValue
  );

  const ecctEnabled = true;

  let confirmationStatementError: string = "";
  if (!confirmationValid) {
    confirmationStatementError = LP_CONFIRMATION_STATEMENT_ERROR;
  }

  let lawfulActivityStatementError: string = "";
  if (!lawfulActivityValid) {
    lawfulActivityStatementError = LP_LAWFUL_ACTIVITY_STATEMENT_ERROR;
  }

  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const backLinkPath = getACSPBackPath(session, companyProfile);
  const previousPage = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
    backLinkPath,
    companyNumber,
    transactionId,
    submissionId
  );

  if (!confirmationValid || !lawfulActivityValid) {
    return {
      renderData: {
        lang,
        locales,
        previousPage,
        confirmationStatementError,
        lawfulActivityStatementError,
        confirmationChecked: confirmationCheckboxValue === "true",
        lawfulActivityChecked: lawfulActivityCheckboxValue === "true",
        ecctEnabled
      }
    };
  }

  const isAcspJourney = isACSPJourney(req.originalUrl);
  const nextPage = getConfirmationPath(isAcspJourney);

  return { nextPage };
}
