import { NextFunction, Request, Response } from "express";
import {
  TASK_LIST_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Templates } from "../../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    // const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    // const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    // const session: Session = req.session as Session;
    // const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);

    return res.render(Templates.ACTIVE_OFFICERS_DETAILS, {
      templateName: Templates.ACTIVE_OFFICERS_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};
