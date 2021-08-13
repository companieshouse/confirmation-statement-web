import { NextFunction, Request, Response } from "express";
import { RADIO_BUTTON_VALUE, SECTIONS, sessionCookieConstants, STATEMENT_OF_CAPITAL_ERROR } from "../../utils/constants";
import { STATEMENT_OF_CAPITAL_PATH, TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getStatementOfCapitalData } from "../../services/statement.of.capital.service";
import { Session } from "@companieshouse/node-session-handler";
import {
  SectionStatus,
  StatementOfCapital
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { formatTitleCase } from "../../utils/format";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";

export const get = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const session: Session = req.session as Session;
    const statementOfCapital: StatementOfCapital = await getStatementOfCapitalData(session, companyNumber);

    req.sessionCookie[sessionCookieConstants.STATEMENT_OF_CAPITAL_KEY] = statementOfCapital;
    statementOfCapital.classOfShares = formatTitleCase(statementOfCapital.classOfShares);

    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      backLinkUrl: urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
      statementOfCapital: statementOfCapital
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
      await sendUpdate(req, SectionStatus.CONFIRMED, SECTIONS.SOC);
      return res.redirect(urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),);
    } else if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SectionStatus.NOT_CONFIRMED, SECTIONS.SOC);
      return res.render(Templates.WRONG_STATEMENT_OF_CAPITAL, {
        templateName: Templates.WRONG_STATEMENT_OF_CAPITAL,
        backLinkUrl: urlUtils
          .getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId),
      });
    }

    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      statementOfCapitalErrorMsg: STATEMENT_OF_CAPITAL_ERROR,
      backLinkUrl: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId),
    });
  } catch (e) {
    return next(e);
  }
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
