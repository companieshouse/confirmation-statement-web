import { NextFunction, Request, Response } from "express";
import { RADIO_BUTTON_VALUE, SECTIONS, STATEMENT_OF_CAPITAL_ERROR } from "../../utils/constants";
import { STATEMENT_OF_CAPITAL_PATH, TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getStatementOfCapitalData } from "../../services/statement.of.capital.service";
import { Session } from "@companieshouse/node-session-handler";
import {
  SectionStatus,
  Shareholder,
  StatementOfCapital
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { formatTitleCase } from "../../utils/format";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { getShareholders } from "../../services/shareholder.service";

export const get = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const session: Session = req.session as Session;
    const statementOfCapital: StatementOfCapital = await getStatementOfCapitalData(session, transactionId, submissionId);
    const sharesValidation = await validateTotalNumberOfShares(session, transactionId, submissionId, +statementOfCapital.totalNumberOfShares);
    const totalAmountUnpaidValidation = typeof statementOfCapital.totalAmountUnpaidForCurrency === 'string';

    statementOfCapital.classOfShares = formatTitleCase(statementOfCapital.classOfShares);

    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
      statementOfCapital: statementOfCapital,
      sharesValidation,
      totalAmountUnpaidValidation
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session ;
    const statementOfCapitalButtonValue = req.body.statementOfCapital;
    const companyNumber = getCompanyNumber(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const statementOfCapital: StatementOfCapital = await getStatementOfCapitalData(session, transactionId, submissionId);
    const sharesValidation = req.body.sharesValidation === 'true';
    const totalAmountUnpaidValidation = req.body.totalAmountUnpaidValidation === 'true';
    statementOfCapital.classOfShares = formatTitleCase(statementOfCapital.classOfShares);

    if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.YES || statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      await sendUpdate(req, SECTIONS.SOC, SectionStatus.CONFIRMED, statementOfCapital);
      return res.redirect(urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId));
    } else if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.NO || !sharesValidation || !totalAmountUnpaidValidation) {
      await sendUpdate(req, SECTIONS.SOC, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_STATEMENT_OF_CAPITAL, {
        templateName: Templates.WRONG_STATEMENT_OF_CAPITAL,
        backLinkUrl: urlUtils
          .getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId),
        sharesValidation,
        totalAmountUnpaidValidation
      });
    }

    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      statementOfCapitalErrorMsg: STATEMENT_OF_CAPITAL_ERROR,
      backLinkUrl: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
      statementOfCapital,
      sharesValidation,
      totalAmountUnpaidValidation
    });
  } catch (e) {
    return next(e);
  }
};

const validateTotalNumberOfShares = async (session: Session, transactionId: string, submissionId: string, totalNumberOfShares: number): Promise<boolean> => {
  const shareholders: Shareholder[] = await getShareholders(session, transactionId, submissionId);
  let shareholderTotalNumberOfShares: number = 0;
  shareholders.forEach(shareholder => shareholderTotalNumberOfShares = +shareholder.shares + shareholderTotalNumberOfShares);
  return totalNumberOfShares === shareholderTotalNumberOfShares;
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
