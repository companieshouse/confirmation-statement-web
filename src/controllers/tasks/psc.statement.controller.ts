import { NextFunction, Request, Response } from "express";
import {
  PSC_STATEMENT_CONTROL_ERROR,
  PSC_STATEMENT_NAME_PLACEHOLDER,
  PSC_STATEMENT_NOT_FOUND,
  RADIO_BUTTON_VALUE,
  SECTIONS,
  WRONG_DETAILS_INCORRECT_PSC,
  WRONG_DETAILS_UPDATE_PSC } from "../../utils/constants";
import {
  ACTIVE_PSC_DETAILS_PATH,
  PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH,
  PSC_STATEMENT_PATH,
  TASK_LIST_PATH,
  URL_QUERY_PARAM
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getMostRecentActivePscStatement } from "../../services/psc.service";
import { Session } from "@companieshouse/node-session-handler";
import { lookupPscStatementDescription } from "../../utils/api.enumerations";
import { createAndLogError } from "../../utils/logger";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 } from "../../utils/properties";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const pscStatement = await getPscStatementText(req);

    return res.render(Templates.PSC_STATEMENT, {
      backLinkUrl: getBackLinkUrl(req),
      pscStatement,
      templateName: Templates.PSC_STATEMENT,
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const pscButtonValue = req.body.pscStatementValue;

    if (pscButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.PSC, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(PSC_STATEMENT_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_PSC,
        pageHeading: WRONG_DETAILS_INCORRECT_PSC,
      });
    }

    if (pscButtonValue === RADIO_BUTTON_VALUE.YES || pscButtonValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      const companyNumber: string = urlUtils.getCompanyNumberFromRequestParams(req);
      const transactionId: string = urlUtils.getTransactionIdFromRequestParams(req);
      const submissionId: string = urlUtils.getSubmissionIdFromRequestParams(req);
      await sendUpdate(req, SECTIONS.PSC, getSectionStatusFromButtonValue(pscButtonValue));
      return res.redirect(urlUtils
        .getUrlWithCompanyNumberTransactionIdAndSubmissionId(TASK_LIST_PATH, companyNumber, transactionId, submissionId));
    }

    const pscStatement = await getPscStatementText(req);
    return res.render(Templates.PSC_STATEMENT, {
      backLinkUrl: getBackLinkUrl(req),
      pscStatementControlErrorMsg: PSC_STATEMENT_CONTROL_ERROR,
      pscStatement,
      templateName: Templates.PSC_STATEMENT,
    });
  } catch (e) {
    return next(e);
  }
};

const getPscStatementText = async (req: Request): Promise<string> => {
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const pscStatement = await getMostRecentActivePscStatement(req.session as Session, companyNumber);

  if (!pscStatement || !pscStatement.statement) {
    return PSC_STATEMENT_NOT_FOUND;
  }
  const pscStatementDescriptionKey: string = pscStatement.statement;

  let pscStatementText: string = lookupPscStatementDescription(pscStatementDescriptionKey);
  if (!pscStatementText) {
    throw createAndLogError(`Unable to convert psc statement ${pscStatementDescriptionKey} using api enumerations`);
  }

  if (pscStatementText.includes(PSC_STATEMENT_NAME_PLACEHOLDER) && pscStatement.linkedPscName) {
    pscStatementText = pscStatementText.replace(PSC_STATEMENT_NAME_PLACEHOLDER,  pscStatement.linkedPscName);
  }
  return pscStatementText;
};

const getBackLinkUrl = (req: Request): string => {
  let path = PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH;
  if (isActiveFeature(FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021)) {
    path = ACTIVE_PSC_DETAILS_PATH;
  }

  if (req.query[URL_QUERY_PARAM.IS_PSC] === "false") {
    path = TASK_LIST_PATH;
  }
  return urlUtils.getUrlToPath(path, req);
};

const getSectionStatusFromButtonValue = (radioButtonValue: RADIO_BUTTON_VALUE): SectionStatus => {
  const buttonStatusMap = {
    [RADIO_BUTTON_VALUE.YES]: SectionStatus.CONFIRMED,
    [RADIO_BUTTON_VALUE.NO]: SectionStatus.NOT_CONFIRMED,
    [RADIO_BUTTON_VALUE.RECENTLY_FILED]: SectionStatus.CONFIRMED
  };
  return buttonStatusMap[radioButtonValue];
};
