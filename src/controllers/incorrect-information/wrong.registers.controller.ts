import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  REGISTER_LOCATIONS_PATH,
  TASK_LIST_PATH} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { RADIO_BUTTON_VALUE, SECTIONS, WRONG_REGISTER_ERROR } from "../../utils/constants";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_REGISTER_LOCATIONS, {
    backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
    taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    templateName: Templates.WRONG_REGISTER_LOCATIONS
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wrongRegistersRadioValue = req.body.radioButton;
    if (!isRadioButtonValueValid(wrongRegistersRadioValue)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(wrongRegistersRadioValue)));
    }
    if (wrongRegistersRadioValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.RECENT_FILING);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    if (wrongRegistersRadioValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    return res.render(Templates.WRONG_REGISTER_LOCATIONS, {
      backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
      taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      errorMsgText: WRONG_REGISTER_ERROR,
      templateName: Templates.WRONG_REGISTER_LOCATIONS
    });
  } catch (e) {
    return next(e);
  }
};
