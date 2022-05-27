import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { ACTIVE_OFFICERS_DETAILS_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_UPDATE_OFFICERS, DETAIL_TYPE_OFFICER, WRONG_OFFICER_ERROR, SECTIONS } from "../../utils/constants";
import { getCommon, postCommon } from "../../utils/wrong.information.stop.screen.common.web.calls";

export const get = (req: Request, res: Response) => {
  return { 
    renderedPage: getCommon(req, res, Templates.WRONG_DETAILS, {
      templateName: Templates.WRONG_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_DETAILS_PATH, req),
      detailType: DETAIL_TYPE_OFFICER,
      detailTypeLegend: DETAIL_TYPE_OFFICER,
      pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
    }),
  };
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return {
      renderedPage: postCommon(req, res, next, SECTIONS.ACTIVE_OFFICER, Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_DETAILS_PATH, req),
        errorMsgText: WRONG_OFFICER_ERROR,
        detailType: DETAIL_TYPE_OFFICER,
        detailTypeLegend: DETAIL_TYPE_OFFICER,
        pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
      }),
    };
  } catch (e) {
    return next(e);
  }
};
