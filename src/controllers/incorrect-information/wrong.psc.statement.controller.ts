import { NextFunction, Request, Response } from "express";
import {
  PSC_STATEMENT_PATH, URL_QUERY_PARAM} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_INCORRECT_PSC, DETAIL_TYPE_PSC_LEGEND, DETAIL_TYPE_PSC, SECTIONS, WRONG_PSC_ERROR } from "../../utils/constants";
import { urlUtils } from "../../utils/url";
import { getCommon, postCommon } from "../../utils/wrong.information.stop.screen.common.web.calls";
import { PersonOfSignificantControl } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { getPscs } from "../../services/psc.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return { 
      renderedPage: getCommon(req, res, Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: await getBackLinkUrl(req, res, next),
        detailType: DETAIL_TYPE_PSC,
        detailTypeLegend: DETAIL_TYPE_PSC_LEGEND,
        pageHeading: WRONG_DETAILS_INCORRECT_PSC,
      }),
    };
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return {
      renderedPage: postCommon(req, res, next, SECTIONS.PSC, Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: await getBackLinkUrl(req, res, next),
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

const getBackLinkUrl = async (req: Request, res: Response, next: NextFunction) => {
  let path = urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, transactionId, submissionId);
  if (!pscs || pscs.length < 1) {
    path = urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, "false");
  } else {
    path = urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, "true");
  }
  return path;
};
