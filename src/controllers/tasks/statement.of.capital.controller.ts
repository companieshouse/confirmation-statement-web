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
    const session: Session = req.session as Session;
    const statementOfCapital: StatementOfCapital = await getStatementOfCapitalData(session, companyNumber);
    if (statementOfCapital.classOfShares) {
      statementOfCapital.classOfShares = formatTitleCase(statementOfCapital.classOfShares);
    }
    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
      statementOfCapital: statementOfCapital,
      statementOfCapitalJSON: JSON.stringify(statementOfCapital)
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const statementOfCapitalButtonValue = req.body.statementOfCapitalCorrect;
    const companyNumber = getCompanyNumber(req);

    const statementOfCapitalContent: StatementOfCapital = JSON.parse(req.body.statementOfCapitalContent);
    const transactionId = req.params.transactionId as string;
    const submissionId = req.params.submissionId as string;

    if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.YES) {
      const session = req.session as Session;
      const csSubmission = buildCsSubmission(submissionId, statementOfCapitalContent, SectionStatus.CONFIRMED);
      updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
      return res.redirect(urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber));
    } else if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_STATEMENT_OF_CAPITAL, {
        templateName: Templates.WRONG_STATEMENT_OF_CAPITAL,
        backLinkUrl: urlUtils.getUrlWithCompanyNumber(STATEMENT_OF_CAPITAL_PATH, companyNumber)
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

const buildCsSubmission = (submissionId: string, statementOfCapital: StatementOfCapital, status: SectionStatus):
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
      self: ""
    }
  };
};


const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
