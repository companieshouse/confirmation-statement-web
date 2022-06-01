import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../../utils/feature.flag";
import { FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 } from "../../utils/properties";
import {
  PSC_STATEMENT_PATH, URL_QUERY_PARAM} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { WRONG_DETAILS_INCORRECT_PSC, DETAIL_TYPE_PSC_LEGEND, DETAIL_TYPE_PSC, SECTIONS, WRONG_PSC_ERROR } from "../../utils/constants";
import { urlUtils } from "../../utils/url";
import { getCommon, postCommon } from "../../utils/wrong.information.stop.screen.common.web.calls";
import { PersonOfSignificantControl } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { getPscs } from "../../services/psc.service";
import { createAndLogError } from "../../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  return { 
    renderedPage: getCommon(req, res, Templates.WRONG_DETAILS, {
      templateName: Templates.WRONG_DETAILS,
      backLinkUrl: await getBackLinkUrl(req, res, next),
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
  try {
    let path = urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req);
    let pscs = await getPscData(req);
    if (pscs) {
      path = urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, "true");
    } else {
      path = urlUtils.setQueryParam(path, URL_QUERY_PARAM.IS_PSC, "false");
    }
  } catch (e) {
    return next(e);
  }
};

const getPscData = async (req: Request) => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, transactionId, submissionId);
  if (!pscs || pscs.length === 0) {
    return false;
  }
  if (isActiveFeature(FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021)) {
    if (pscs.length > 5) {
      throw createAndLogError(`More than five, (${pscs.length}) PSC returned for company ${companyNumber}`);
    }
  } else {
    if (pscs.length > 1) {
      throw createAndLogError(`More than one (${pscs.length}) PSC returned for company ${companyNumber}`);
    }
  }
  return true;
};

