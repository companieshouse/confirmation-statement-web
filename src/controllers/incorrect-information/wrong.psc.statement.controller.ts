import { NextFunction, Request, Response } from "express";
import {
  PSC_STATEMENT_PATH, TASK_LIST_PATH, URL_QUERY_PARAM} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { SECTIONS, WRONG_PSC_ERROR, RADIO_BUTTON_VALUE, WRONG_PSC_STATEMENT_TEXT } from "../../utils/constants";
import { urlUtils } from "../../utils/url";
import { PersonOfSignificantControl, SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { getPscs } from "../../services/psc.service";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { isRadioButtonValueValid, getRadioButtonInvalidValueErrorMessage } from "../../validators/radio.button.validator";
import { EWF_URL } from "../../utils/properties";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.WRONG_PSC_DETAILS, {
      EWF_URL,
      templateName: Templates.WRONG_PSC_DETAILS,
      backLinkUrl: await getBackLinkUrl(req, res, next),
      dataEventIdText: WRONG_PSC_STATEMENT_TEXT
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wrongPscStatementRadioValue = req.body.radioButton;
    if (!isRadioButtonValueValid(wrongPscStatementRadioValue)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(wrongPscStatementRadioValue)));
    }
    if (wrongPscStatementRadioValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.RECENT_FILING);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    if (wrongPscStatementRadioValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    return res.render(Templates.WRONG_PSC_DETAILS, {
      EWF_URL,
      templateName: Templates.WRONG_PSC_DETAILS,
      backLinkUrl: await getBackLinkUrl(req, res, next),
      errorMsgText: WRONG_PSC_ERROR,
      dataEventIdText: WRONG_PSC_STATEMENT_TEXT
    });
  } catch (e) {
    return next(e);
  }
};

const getBackLinkUrl = async (req: Request, res: Response, next: NextFunction) => {
  let path = urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, transactionId, submissionId);
  if (!pscs || pscs.length < 1) {
    path = urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, "false");
  } else {
    path = urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, "true");
  }
  return path;
};
