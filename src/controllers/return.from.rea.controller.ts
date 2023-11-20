import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { SECTIONS } from "../utils/constants";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { TASK_LIST_PATH, CHECK_EMAIL_ADDRESS_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { sendUpdate } from "../utils/update.confirmation.statement.submission";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const registeredEmailAddressSubmitted: boolean = session.getExtraData("registeredEmailAddressSubmitted") as boolean;
    if (registeredEmailAddressSubmitted === true) {
      await sendUpdate(req, SECTIONS.EMAIL, SectionStatus.RECENT_FILING);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }
    return res.redirect(urlUtils.getUrlToPath(CHECK_EMAIL_ADDRESS_PATH, req));
  } catch (e) {
    return next(e);
  }
};
