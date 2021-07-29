import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import {
  PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR, RADIO_BUTTON_VALUE } from "../../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
      templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL,
      backLinkUrl: urlUtils
        .getUrlToPath(TASK_LIST_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButtonValue = req.body.pscRadioValue;
    if (pscButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_PSC_DETAILS, {
        templateName: Templates.WRONG_PSC_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      });
    }

    return res.render(Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL, {
      templateName: Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL,
      peopleWithSignificantControlErrorMsg: PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};
