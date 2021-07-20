import { NextFunction, Request, Response } from "express";
import { RADIO_BUTTON_VALUE, STATEMENT_OF_CAPITAL_ERROR } from "../../utils/constants";
import { STATEMENT_OF_CAPITAL_PATH, TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getStatementOfCapitalData } from "../../services/statement.of.capital.service";
import { Session } from "@companieshouse/node-session-handler";
import {
  ConfirmationStatementSubmission,
  SectionStatus,
  StatementOfCapital
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { formatTitleCase } from "../../utils/format";
import { updateConfirmationStatement } from "../../services/confirmation.statement.service";

export const get = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const session: Session = req.session as Session;
    const statementOfCapital: StatementOfCapital = await getStatementOfCapitalData(session, companyNumber);
    if (statementOfCapital.classOfShares) {
      statementOfCapital.classOfShares = formatTitleCase(statementOfCapital.classOfShares);
    }
    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      statementOfCapital: statementOfCapital,
      statementOfCapitalJSON: JSON.stringify(statementOfCapital),
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statementOfCapitalButtonValue = req.body.statementOfCapital;
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];

    if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.YES) {
      const transactionId = req.params.transactionId as string;
      const submissionId = req.params.submissionId as string;
      await sendUpdate(transactionId, submissionId, req);
      return res.redirect(urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber,
                                                                                       transactionId, submissionId));
      return res.redirect(urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),);
    } else if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_STATEMENT_OF_CAPITAL, {
        templateName: Templates.WRONG_STATEMENT_OF_CAPITAL,
        backLinkUrl: urlUtils
          .getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId),
      });
    }

    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      statementOfCapitalErrorMsg: STATEMENT_OF_CAPITAL_ERROR,
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
    });
  } catch (e) {
    return next(e);
  }
};

const sendUpdate = async (transactionId: string, submissionId: string, req: Request) => {
  const statementOfCapitalContent: StatementOfCapital = JSON.parse(req.body.statementOfCapitalContent);
  const session = req.session as Session;
  const csSubmission = buildCsSubmission(submissionId, transactionId, statementOfCapitalContent, SectionStatus.CONFIRMED);
  await updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
};

const buildCsSubmission = (submissionId: string, transactionId: string, statementOfCapital: StatementOfCapital, status: SectionStatus):
    ConfirmationStatementSubmission => {
  return {
    id: submissionId,
    data: {
      statementOfCapitalData: {
        sectionStatus: status,
        statementOfCapital: statementOfCapital
      }
    },
    links: {
      self: `/transactions/${transactionId}/confirmation-statement/${submissionId}`
    }
  };
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
