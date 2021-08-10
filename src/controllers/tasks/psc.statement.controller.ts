import { NextFunction, Request, Response } from "express";
import { PSC_STATEMENT_CONTROL_ERROR, PSC_STATEMENT_NOT_FOUND } from "../../utils/constants";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getMostRecentActivePscStatement } from "../../services/psc.service";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const pscStatementText = await getPscStatementText(req);

    return res.render(Templates.PSC_STATEMENT, {
      backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
      pscStatement: pscStatementText,
      templateName: Templates.PSC_STATEMENT,
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButtonValue = req.body.pscStatementValue;

    if (!pscButtonValue) {
      const pscStatement = PSC_STATEMENT_NOT_FOUND;
      return res.render(Templates.PSC_STATEMENT, {
        backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
        pscStatementControlErrorMsg: PSC_STATEMENT_CONTROL_ERROR,
        pscStatement,
        templateName: Templates.PSC_STATEMENT,
      });
    }
  } catch (e) {
    return next(e);
  }
};

const getPscStatementText = async (req: Request): Promise<string> => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const pscStatement = await getMostRecentActivePscStatement(req.session as Session, companyNumber);
  return pscStatement?.statement || PSC_STATEMENT_NOT_FOUND;
};
