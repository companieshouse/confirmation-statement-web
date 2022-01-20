import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.ACTIVE_PSC_DETAILS, {
      templateName: Templates.ACTIVE_PSC_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};
