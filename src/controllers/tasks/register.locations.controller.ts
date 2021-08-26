import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.REGISTER_LOCATIONS, {
      templateName: Templates.REGISTER_LOCATIONS,
      backLinkUrl });
  } catch (error) {
    return next(error);
  }
};