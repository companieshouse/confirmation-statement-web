import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { isCheckboxTicked } from "../components/check.box";
import { LP_CONFIRMATION_STATEMENT_ERROR, LP_LAWFUL_ACTIVITY_STATEMENT_ERROR, CONFIRMATION_STATEMENT_SESSION_KEY, LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY } from "../../utils/constants";
import { getACSPBackPath, isACSPJourney, getConfirmationPath } from "../../utils/limited.partnership";
import { selectLang, getLocalesService } from "../../utils/localise";
import { urlUtils } from "../../utils/url";
import { ConfirmationStatementSubmission, SicCodeData } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement, updateConfirmationStatement } from "../../services/confirmation.statement.service";
import { getTransaction } from '../../services/transaction.service';
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

export function handleLimitedPartnershipConfirmationJourney (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  companyNumber: string, companyProfile: CompanyProfile, transactionId: string, submissionId: string, session: Session) {

  const confirmationCheckboxValue = req.body.confirmationStatement;
  const lawfulActivityCheckboxValue = req.body.lawfulActivityStatement;

  const confirmationValid = isCheckboxTicked(
    confirmationCheckboxValue
  );

  req.session?.setExtraData(CONFIRMATION_STATEMENT_SESSION_KEY, confirmationValid ? "true" : "false");

  const lawfulActivityValid = isCheckboxTicked(
    lawfulActivityCheckboxValue
  );

  req.session?.setExtraData(LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY, lawfulActivityValid ? "true" : "false");

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
        confirmationChecked: confirmationValid,
        lawfulActivityChecked: lawfulActivityValid,
        ecctEnabled
      }
    };
  }

  const isAcspJourney = isACSPJourney(req.originalUrl);
  const nextPage = getConfirmationPath(isAcspJourney);

  return { nextPage };
}

export async function sendLimitedPartnershipTransactionUpdate(req: Request, newCsDate: string | null, newSicCodes: SicCodeData | null) {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session = req.session as Session;

  const currentCsSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
  currentCsSubmission.data.newConfirmationDate = newCsDate;
  currentCsSubmission.data.sicCodeData = newSicCodes ?? undefined;

  await updateConfirmationStatement(session, transactionId, submissionId, currentCsSubmission);
}

export async function fetchTransaction(session: Session, req: Request): Promise<Transaction> {
  const transactionId = req.params.transactionId || req.query.transactionId;
  if (!transactionId || typeof transactionId !== "string") {
    throw new Error("Missing or invalid transaction ID");
  }
  return await getTransaction(session, transactionId);
}
