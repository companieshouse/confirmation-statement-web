import { Templates } from "../../types/template.paths";
import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH, SHAREHOLDERS_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { RADIO_BUTTON_VALUE, SHAREHOLDERS_ERROR } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { Shareholder } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getShareholders } from "../../services/shareholder.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const shareholders: Shareholder[] = await getShareholders(session, companyNumber);
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

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const shareholdersButtonValue = req.body.shareholders;

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (shareholdersButtonValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_SHAREHOLDERS, {
        backLinkUrl: urlUtils.getUrlToPath(SHAREHOLDERS_PATH, req),
        templateName: Templates.WRONG_SHAREHOLDERS,
      });
    }

    return res.render(Templates.SHAREHOLDERS, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      shareholdersErrorMsg: SHAREHOLDERS_ERROR,
      templateName: Templates.SHAREHOLDERS
    });
  } catch (e) {
    return next(e);
  }
};
