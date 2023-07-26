import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  ACTIVE_PSC_DETAILS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { SECTIONS, WRONG_PSC_ERROR, RADIO_BUTTON_VALUE, WRONG_PSC_DETAILS_TEXT } from "../../utils/constants";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";
import { EWF_URL } from "../../utils/properties";


export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_PSC_DETAILS, {
    EWF_URL,
    templateName: Templates.WRONG_PSC_DETAILS,

    backLinkUrl: urlUtils.getUrlToPath(ACTIVE_PSC_DETAILS_PATH, req),
    dataEventIdText: WRONG_PSC_DETAILS_TEXT
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wrongPscDetailsRadioValue = req.body.radioButton;
    if (!isRadioButtonValueValid(wrongPscDetailsRadioValue)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(wrongPscDetailsRadioValue)));
    }
    if (wrongPscDetailsRadioValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.NOT_CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    if (wrongPscDetailsRadioValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.NOT_CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    return res.render(Templates.WRONG_PSC_DETAILS, {
      EWF_URL,
      templateName: Templates.WRONG_PSC_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_PSC_DETAILS_PATH, req),
      errorMsgText: WRONG_PSC_ERROR,
      dataEventIdText: WRONG_PSC_DETAILS_TEXT
    });
  } catch (e) {
    return next(e);
  }
};
