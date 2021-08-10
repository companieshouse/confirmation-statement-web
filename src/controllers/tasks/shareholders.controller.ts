import { Templates } from "../../types/template.paths";
import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH, SHAREHOLDERS_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { RADIO_BUTTON_VALUE, SHAREHOLDERS_ERROR } from "../../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.SHAREHOLDERS, { backLinkUrl });
  } catch (error) {
    return next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const shareholdersButtonValue = req.body.shareholders;

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_SHAREHOLDERS, {
        backLinkUrl: urlUtils.getUrlToPath(SHAREHOLDERS_PATH, req),
        templateName: Templates.WRONG_SHAREHOLDERS,
      });
    }

    return res.render(Templates.SHAREHOLDERS, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      shareholdersErrorMsg: SHAREHOLDERS_ERROR,
      templateName: Templates.SHAREHOLDERS
    });
  } catch (e) {
    return next(e);
  }
};
