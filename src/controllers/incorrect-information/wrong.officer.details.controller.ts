import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { ACTIVE_OFFICERS_DETAILS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_UPDATE_OFFICERS, DETAIL_TYPE_OFFICER, RADIO_BUTTON_VALUE, SECTIONS, WRONG_OFFICER_ERROR } from "../../utils/constants";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_DETAILS, {
    templateName: Templates.WRONG_DETAILS,
    backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_DETAILS_PATH, req),
    detailType: DETAIL_TYPE_OFFICER,
    detailTypeLegend: DETAIL_TYPE_OFFICER,
    pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const officerButton = req.body.radioButton;

    if (!isRadioButtonValueValid(officerButton)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(officerButton)));
    }

    if (officerButton === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (officerButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    return res.render(Templates.WRONG_DETAILS, {
      templateName: Templates.WRONG_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_DETAILS_PATH, req),
      errorMsg: WRONG_OFFICER_ERROR,
      detailType: DETAIL_TYPE_OFFICER,
      detailTypeLegend: DETAIL_TYPE_OFFICER,
      pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
    });
  } catch (e) {
    return next(e);
  }
};
