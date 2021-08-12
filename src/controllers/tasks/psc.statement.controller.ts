import { NextFunction, Request, Response } from "express";
import {
  PSC_STATEMENT_CONTROL_ERROR,
  PSC_STATEMENT_NAME_PLACEHOLDER,
  PSC_STATEMENT_NOT_FOUND,
  RADIO_BUTTON_VALUE,
  sessionCookieConstants,
  WRONG_DETAILS_INCORRECT_PSC,
  WRONG_DETAILS_UPDATE_PSC } from "../../utils/constants";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, PSC_STATEMENT_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getMostRecentActivePscStatement } from "../../services/psc.service";
import { Session } from "@companieshouse/node-session-handler";
import { lookupPscStatementDescription } from "../../utils/api.enumerations";
import { createAndLogError } from "../../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const pscStatement = await getPscStatementText(req);
    req.sessionCookie[sessionCookieConstants.PSC_STATEMENT_KEY] = pscStatement;

    return res.render(Templates.PSC_STATEMENT, {
      backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
      pscStatement,
      templateName: Templates.PSC_STATEMENT,
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButtonValue = req.body.pscStatementValue;

    if (pscButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_PSC,
        pageHeading: WRONG_DETAILS_INCORRECT_PSC,
      });
    }

    const pscStatement: string = req.sessionCookie[sessionCookieConstants.PSC_STATEMENT_KEY];
    return res.render(Templates.PSC_STATEMENT, {
      backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
      pscStatementControlErrorMsg: PSC_STATEMENT_CONTROL_ERROR,
      pscStatement,
      templateName: Templates.PSC_STATEMENT,
    });
  } catch (e) {
    return next(e);
  }
};

const getPscStatementText = async (req: Request): Promise<string> => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const pscStatement = await getMostRecentActivePscStatement(req.session as Session, companyNumber);

  if (!pscStatement || !pscStatement.statement) {
    return PSC_STATEMENT_NOT_FOUND;
  }
  const pscStatementDescriptionKey: string = pscStatement.statement;

  let pscStatementText: string = lookupPscStatementDescription(pscStatementDescriptionKey);
  if (!pscStatementText) {
    throw createAndLogError(`Unable to convert psc statement ${pscStatementDescriptionKey} using api enumerations`);
  }

  if (pscStatementText.includes(PSC_STATEMENT_NAME_PLACEHOLDER) && pscStatement.linkedPscName) {
    pscStatementText = pscStatementText.replace(PSC_STATEMENT_NAME_PLACEHOLDER,  pscStatement.linkedPscName);
  }
  return pscStatementText;
};
