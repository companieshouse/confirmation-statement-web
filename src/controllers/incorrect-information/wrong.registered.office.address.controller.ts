import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  CHANGE_ROA_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { RADIO_BUTTON_VALUE, SECTIONS, WRONG_ROA_ERROR } from "../../utils/constants";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_RO, {
    backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
    taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req)
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registeredOfficeButton = req.body.radioButton;

    if (!isRadioButtonValueValid(registeredOfficeButton)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(registeredOfficeButton)));
    }

    if (registeredOfficeButton === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (registeredOfficeButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    return res.render(Templates.WRONG_RO, {
      backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
      taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      errorMsg: WRONG_ROA_ERROR,
      changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req)
    });
  } catch (e) {
    return next(e);
  }
};
