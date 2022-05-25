import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  REGISTER_LOCATIONS_PATH,
  TASK_LIST_PATH} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { SECTIONS, WRONG_REGISTER_ERROR } from "../../utils/constants";
import { getCommon, postCommon } from "../../utils/wrong.information.stop.screen.common.web.calls";

export const get = (req: Request, res: Response) => {
  return { 
    renderedPage: getCommon(req, res, Templates.WRONG_REGISTER_LOCATIONS, {
      backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
      taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      templateName: Templates.WRONG_REGISTER_LOCATIONS
    }),
  };
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return {
      renderedPage: postCommon(req, res, next, SECTIONS.REGISTER_LOCATIONS, Templates.WRONG_REGISTER_LOCATIONS, {
        backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
        taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        errorMsg: WRONG_REGISTER_ERROR,
        templateName: Templates.WRONG_REGISTER_LOCATIONS
      }),
    };
  } catch (e) {
    return next(e);
  }
};
