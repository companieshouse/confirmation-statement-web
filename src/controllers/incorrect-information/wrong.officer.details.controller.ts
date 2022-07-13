import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { ACTIVE_OFFICERS_DETAILS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_UPDATE_OFFICERS, DETAIL_TYPE_OFFICER, WRONG_OFFICER_ERROR, SECTIONS, RADIO_BUTTON_VALUE } from "../../utils/constants";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { getRadioButtonInvalidValueErrorMessage, isRadioButtonValueValid } from "../../validators/radio.button.validator";
import { EWF_URL } from "../../utils/properties";


export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_DETAILS, { 
    EWF_URL,
    templateName: Templates.WRONG_DETAILS,
    backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_DETAILS_PATH, req),
    pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
    detailType: DETAIL_TYPE_OFFICER,
    detailTypeLegend: DETAIL_TYPE_OFFICER,
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wrongOfficersRadioValue = req.body.radioButton;
    if (!isRadioButtonValueValid(wrongOfficersRadioValue)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(wrongOfficersRadioValue)));
    }
    if (wrongOfficersRadioValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.RECENT_FILING);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    if (wrongOfficersRadioValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    return res.render(Templates.WRONG_DETAILS, {
      EWF_URL,
      templateName: Templates.WRONG_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_DETAILS_PATH, req),
      errorMsgText: WRONG_OFFICER_ERROR,
      detailType: DETAIL_TYPE_OFFICER,
      detailTypeLegend: DETAIL_TYPE_OFFICER,
      pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
    });
  } catch (e) {
    return next(e);
  }
};
