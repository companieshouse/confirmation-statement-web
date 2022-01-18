import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { ACTIVE_OFFICERS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import {
  OFFICER_DETAILS_ERROR,
  RADIO_BUTTON_VALUE,
  SECTIONS,
  WRONG_DETAILS_UPDATE_OFFICER,
  WRONG_DETAILS_UPDATE_OFFICERS } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import {
  ActiveOfficerDetails,
  SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

import { formatAddressForDisplay, formatOfficerDetails, formatTitleCase } from "../../utils/format";
import { getActiveOfficerDetailsData } from "../../services/active.director.details.service";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerDetails: ActiveOfficerDetails = await getActiveOfficerDetailsData(session, transactionId, submissionId);
    const activeOfficerDetails = formatOfficerDetails(officerDetails);
    const serviceAddress = formatAddressForDisplay(activeOfficerDetails.serviceAddress);
    const residentialAddress = formatAddressForDisplay(activeOfficerDetails.residentialAddress);
    const countryOfResidence = formatTitleCase(activeOfficerDetails.countryOfResidence);

    return res.render(Templates.ACTIVE_OFFICERS, {
      templateName: Templates.ACTIVE_OFFICERS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      activeOfficerDetails,
      serviceAddress,
      residentialAddress,
      countryOfResidence
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const activeOfficerDetailsBtnValue = req.body.activeOfficers;
    if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.YES || activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_OFFICER,
        pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
      });
    } else {
      const officerDetails: ActiveOfficerDetails = await getActiveOfficerDetailsData(session, transactionId, submissionId);
      const activeOfficerDetails = formatOfficerDetails(officerDetails);
      const serviceAddress = formatAddressForDisplay(activeOfficerDetails?.serviceAddress);
      const residentialAddress = formatAddressForDisplay(activeOfficerDetails?.residentialAddress);
      return res.render(Templates.ACTIVE_OFFICERS, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        officerErrorMsg: OFFICER_DETAILS_ERROR,
        templateName: Templates.ACTIVE_OFFICERS,
        activeOfficerDetails,
        serviceAddress,
        residentialAddress
      });
    }
  } catch (e) {
    return next(e);
  }
};
