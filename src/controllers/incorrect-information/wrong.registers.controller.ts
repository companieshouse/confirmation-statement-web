import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  REGISTER_LOCATIONS_PATH,
  TASK_LIST_PATH} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { RADIO_BUTTON_VALUE, SECTIONS, WRONG_REGISTER_ERROR } from "../../utils/constants";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.WRONG_REGISTER_LOCATIONS, {
      backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
      taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      templateName: Templates.WRONG_REGISTER_LOCATIONS
    });
  } catch (error) {
    return next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registerLocationsButton = req.body.radioButton;

    if (!isRadioButtonValueValid(registerLocationsButton)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(registerLocationsButton)));
    }

    if (registerLocationsButton === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (registerLocationsButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    return res.render(Templates.WRONG_REGISTER_LOCATIONS, {
      backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
      taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      errorMsg: WRONG_REGISTER_ERROR,
      templateName: Templates.WRONG_REGISTER_LOCATIONS
    });
  } catch (e) {
    return next(e);
  }
};
