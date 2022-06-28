import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { RADIO_BUTTON_VALUE } from "./constants";
import { sendUpdate } from "./update.confirmation.statement.submission";
import { getRadioButtonInvalidValueErrorMessage, isRadioButtonValueValid } from "../validators/radio.button.validator";
import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH } from "../types/page.urls";
import { urlUtils } from "./url";

export const getCommon = (req: Request, res: Response, templateName, renderData) => {
  return res.render(templateName, renderData);
};

export const postCommon = async (req: Request, res: Response, next: NextFunction, sectionName, templateName, renderData) => {
  try {
    const radioButton = req.body.radioButton;

    if (!isRadioButtonValueValid(radioButton)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(radioButton)));
    }

    if (radioButton === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, sectionName, SectionStatus.RECENT_FILING);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (radioButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, sectionName, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    return res.render(templateName, renderData);
  } catch (e) {
    return next(e);
  }
};