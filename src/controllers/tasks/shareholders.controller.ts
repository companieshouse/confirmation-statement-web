import { Templates } from "../../types/template.paths";
import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH, WRONG_SHAREHOLDERS_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { RADIO_BUTTON_VALUE, SECTIONS, SHAREHOLDERS_ERROR } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { SectionStatus, Shareholder } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getShareholders } from "../../services/shareholder.service";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { formatTitleCase } from "../../utils/format";
import { isRadioButtonValid } from "../../validators/radio.button.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const shareholdersData: Shareholder[] = await getShareholders(session, transactionId, submissionId);
    const shareholders = formatShareholders(shareholdersData);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(
      Templates.SHAREHOLDERS, {
        backLinkUrl,
        shareholders
      });
  } catch (error) {
    return next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shareholdersButtonValue = req.body.shareholders;

    if (!isRadioButtonValid(shareholdersButtonValue)) {
      return next(new Error("No valid radio button id in request"));
    }

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.SHAREHOLDER, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.SHAREHOLDER, SectionStatus.NOT_CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(WRONG_SHAREHOLDERS_PATH, req));
    }

    const session: Session = req.session as Session;
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const shareholdersData: Shareholder[] = await getShareholders(session, transactionId, submissionId);
    const shareholders = formatShareholders(shareholdersData);
    return res.render(Templates.SHAREHOLDERS, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      shareholdersErrorMsg: SHAREHOLDERS_ERROR,
      templateName: Templates.SHAREHOLDERS,
      shareholders
    });
  } catch (e) {
    return next(e);
  }
};

const formatShareholders = (shareholders: Shareholder[]): Shareholder[] => {
  const formattedShareholders = new Array<Shareholder>();
  shareholders.forEach(shareholder => {
    const clone: Shareholder = JSON.parse(JSON.stringify(shareholder));
    clone.foreName1 = formatTitleCase(shareholder.foreName1);
    clone.foreName2 = formatTitleCase(shareholder.foreName2);
    clone.classOfShares = formatTitleCase(shareholder.classOfShares);
    clone.currency = shareholder.currency;
    clone.shares = shareholder.shares;
    clone.surname = shareholder.surname;
    formattedShareholders.push(clone);
  });
  return formattedShareholders;
};
