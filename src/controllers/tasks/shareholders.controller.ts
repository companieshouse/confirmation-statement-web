import { Templates } from "../../types/template.paths";
import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH, urlParams, SHAREHOLDERS_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { RADIO_BUTTON_VALUE, SHAREHOLDERS_ERROR } from "../../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
    return res.render(Templates.SHAREHOLDERS, { backLinkUrl });
  } catch (error) {
    return next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const shareholdersButtonValue = req.body.shareholders;
    const companyNumber = getCompanyNumber(req);

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber));
    }

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_SHAREHOLDERS, {
        backLinkUrl: urlUtils.getUrlWithCompanyNumber(SHAREHOLDERS_PATH, companyNumber),
        templateName: Templates.WRONG_SHAREHOLDERS,
      });
    }

    return res.render(Templates.SHAREHOLDERS, {
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
      shareholdersErrorMsg: SHAREHOLDERS_ERROR,
      templateName: Templates.SHAREHOLDERS
    });
  } catch (e) {
    return next(e);
  }
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
