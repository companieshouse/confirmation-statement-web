import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { REGISTERED_EMAIL_ADDRESS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { SECTIONS } from "utils/constants";
import { sendUpdate } from "utils/update.confirmation.statement.submission";


export const get = (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = req.session as Session;
      const backLinkUrl = urlUtils.getUrlToPath(REGISTERED_EMAIL_ADDRESS_PATH, req);
      const emailAddress = session.getExtraData("entered-email-address");
      return res.render(Templates.CHECK_EMAIL_ADDRESS, {
        templateName: Templates.CHECK_EMAIL_ADDRESS,
        backLinkUrl, emailAddress
      });
    } catch (error) {
      return next(error);
    }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendUpdate(req, SECTIONS.ROA, SectionStatus.CONFIRMED);
    return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
  } catch (error) {
    return next(error);
  }
};