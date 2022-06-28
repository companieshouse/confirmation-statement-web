import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  CHANGE_ROA_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { RADIO_BUTTON_VALUE, SECTIONS, WRONG_ROA_ERROR } from "../../utils/constants";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_RO, {
    backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
    taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req),
    templateName: Templates.WRONG_RO
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wrongRoaRadioValue = req.body.radioButton;
    if (!isRadioButtonValueValid(wrongRoaRadioValue)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(wrongRoaRadioValue)));
    }
    if (wrongRoaRadioValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.RECENT_FILING);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    if (wrongRoaRadioValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    return res.render(Templates.WRONG_RO, {
      backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
      taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      errorMsgText: WRONG_ROA_ERROR,
      changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req),
      templateName: Templates.WRONG_RO
    });
  } catch (e) {
    return next(e);
  }
};
