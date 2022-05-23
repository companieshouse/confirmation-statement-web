import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { NextFunction, Request, Response } from "express";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";
import {
  PSC_STATEMENT_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_INCORRECT_PSC, DETAIL_TYPE_PSC_LEGEND, DETAIL_TYPE_PSC, RADIO_BUTTON_VALUE, SECTIONS, WRONG_PSC_ERROR } from "../../utils/constants";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_DETAILS, {
    templateName: Templates.WRONG_DETAILS,
    backLinkUrl: urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req),
    detailType: DETAIL_TYPE_PSC,
    detailTypeLegend: DETAIL_TYPE_PSC_LEGEND,
    pageHeading: WRONG_DETAILS_INCORRECT_PSC,
  });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButton = req.body.radioButton;

    if (!isRadioButtonValueValid(pscButton)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(pscButton)));
    }

    if (pscButton === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (pscButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    return res.render(Templates.WRONG_DETAILS, {
      templateName: Templates.WRONG_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req),
      errorMsg: WRONG_PSC_ERROR,
      detailType: DETAIL_TYPE_PSC,
      detailTypeLegend: DETAIL_TYPE_PSC_LEGEND,
      pageHeading: WRONG_DETAILS_INCORRECT_PSC,
    });
  } catch (e) {
    return next(e);
  }
};
