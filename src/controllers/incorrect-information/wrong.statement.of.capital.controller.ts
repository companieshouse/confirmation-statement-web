import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { STATEMENT_OF_CAPITAL_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { StatementOfCapital } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getStatementOfCapitalData, validateTotalNumberOfShares } from "../../services/statement.of.capital.service";
import { Session } from "@companieshouse/node-session-handler";
import { EWF_URL } from "../../utils/properties";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const statementOfCapital: StatementOfCapital = await getStatementOfCapitalData(session, transactionId, submissionId);
    const sharesValidation = await validateTotalNumberOfShares(session, transactionId, submissionId, + statementOfCapital.totalNumberOfShares);
    const totalAmountUnpaidValidation = typeof statementOfCapital.totalAmountUnpaidForCurrency === 'string';

    return res.render(Templates.WRONG_STATEMENT_OF_CAPITAL, {
      EWF_URL,
      backLinkUrl: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId),
      templateName: Templates.WRONG_STATEMENT_OF_CAPITAL,
      sharesValidation,
      totalAmountUnpaidValidation
    });
  } catch (e) {
    return next(e);
  }
};
