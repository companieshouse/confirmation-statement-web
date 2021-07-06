import { NextFunction, Request, Response } from "express";
import { RADIO_BUTTON_VALUE, STATEMENT_OF_CAPITAL_ERROR } from "../../utils/constants";
import { STATEMENT_OF_CAPITAL_PATH, TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getStatementOfCapitalData } from "../../services/statement.of.capital.service";
import { Session } from "@companieshouse/node-session-handler";
import { StatementOfCapital } from "private-api-sdk-node/dist/services/confirmation-statement";

export const get = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const session: Session = req.session as Session;
    const transactionId: string = "018063-830516-255834";
    const statementOfCapital: StatementOfCapital = await getStatementOfCapitalData(session, transactionId, companyNumber);
    return res.render(Templates.STATEMENT_OF_CAPITAL, {
      templateName: Templates.STATEMENT_OF_CAPITAL,
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
      statementOfCapital: statementOfCapital
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const statementOfCapitalButtonValue = req.body.statementOfCapital;
    const companyNumber = getCompanyNumber(req);

    if (statementOfCapitalButtonValue === RADIO_BUTTON_VALUE.YES) {
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

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
