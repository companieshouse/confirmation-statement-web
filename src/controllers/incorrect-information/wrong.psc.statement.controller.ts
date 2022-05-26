import { NextFunction, Request, Response } from "express";
import {
  PSC_STATEMENT_PATH} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_INCORRECT_PSC, DETAIL_TYPE_PSC_LEGEND, DETAIL_TYPE_PSC, SECTIONS, WRONG_PSC_ERROR } from "../../utils/constants";
import { urlUtils } from "../../utils/url";
import { getCommon, postCommon } from "../../utils/wrong.information.stop.screen.common.web.calls";

export const get = (req: Request, res: Response) => {
  return { 
    renderedPage: getCommon(req, res, Templates.WRONG_DETAILS, {
      templateName: Templates.WRONG_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req),
      detailType: DETAIL_TYPE_PSC,
      detailTypeLegend: DETAIL_TYPE_PSC_LEGEND,
      pageHeading: WRONG_DETAILS_INCORRECT_PSC,
    }),
  };
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return {
      renderedPage: postCommon(req, res, next, SECTIONS.PSC, Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req),
        detailType: DETAIL_TYPE_PSC,
        detailTypeLegend: DETAIL_TYPE_PSC_LEGEND,
        pageHeading: WRONG_DETAILS_INCORRECT_PSC,
        errorMsgText: WRONG_PSC_ERROR,
      }),
    };
  } catch (e) {
    return next(e);
  }
};
