import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { NATURAL_PERSON_SECRETARIES_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { RADIO_BUTTON_VALUE, SECRETARY_DETAILS_ERROR, WRONG_DETAILS_UPDATE_OFFICERS, WRONG_DETAILS_UPDATE_SECRETARY } from "../../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.NATURAL_PERSON_SECRETARIES, {
      templateName: Templates.NATURAL_PERSON_SECRETARIES,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req)
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const natPersonSecretariesBtnValue = req.body.naturalPersonSecretaries;
    if (natPersonSecretariesBtnValue === RADIO_BUTTON_VALUE.YES || natPersonSecretariesBtnValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      //TODO update with correct next page in journey (not task list)
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (natPersonSecretariesBtnValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(NATURAL_PERSON_SECRETARIES_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_SECRETARY,
        pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
      });
    } else {
      return res.render(Templates.NATURAL_PERSON_SECRETARIES, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        secretaryErrorMsg: SECRETARY_DETAILS_ERROR,
        templateName: Templates.NATURAL_PERSON_SECRETARIES
      });
    }
  } catch (e) {
    return next(e);
  }
};
