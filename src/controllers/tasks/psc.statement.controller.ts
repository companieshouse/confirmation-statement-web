import { NextFunction, Request, Response } from "express";
import { PSC_STATEMENT_CONTROL_ERROR, PSC_STATEMENT_NOT_FOUND, RADIO_BUTTON_VALUE } from "../../utils/constants";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, PSC_STATEMENT_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {

    const pscStatement = PSC_STATEMENT_NOT_FOUND;

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
        stepOneHeading: "Update the people with significant control (PSC) details",
        pageHeading: "Incorrect people with significant control - File a confirmation statement",
      });
    }

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
