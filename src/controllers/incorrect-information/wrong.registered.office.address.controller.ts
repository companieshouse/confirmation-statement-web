import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  CHANGE_ROA_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  TASK_LIST_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { SECTIONS, WRONG_ROA_ERROR } from "../../utils/constants";
import { getCommon, postCommon } from "../../utils/wrong.information.stop.screen.common.web.calls";

export const get = (req: Request, res: Response) => {
  console.log("INSIDE GET");
  return { 
    renderedPage: getCommon(req, res, Templates.WRONG_RO, {
      backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
      taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req),
      templateName: Templates.WRONG_REGISTER_LOCATIONS
    }),
  };
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  console.log("INSIDE POST");
  
  try {
    return {
      renderedPage: postCommon(req, res, next, SECTIONS.ROA, Templates.WRONG_RO, {
        backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
        taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        errorMsg: WRONG_ROA_ERROR,
        changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req)
      }),
    };
  } catch (e) {
    return next(e);
  }
};
