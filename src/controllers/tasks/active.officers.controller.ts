import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { ACTIVE_OFFICERS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { OFFICER_DETAILS_ERROR, RADIO_BUTTON_VALUE, sessionCookieConstants } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficerDetailsData } from "../../services/active.officer.details.service";
import { formatTitleCase } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const activeOfficerDetails: ActiveOfficerDetails = await getActiveOfficerDetailsData(session, companyNumber);
    req.sessionCookie[sessionCookieConstants.ACTIVE_OFFICER_DETAILS_KEY] = activeOfficerDetails;
    activeOfficerDetails.foreName1 = formatTitleCase(activeOfficerDetails.foreName1);
    if (activeOfficerDetails.foreName2) {
      activeOfficerDetails.foreName2 = formatTitleCase(activeOfficerDetails.foreName2);
    }

    return res.render(Templates.ACTIVE_OFFICERS, {
      templateName: Templates.ACTIVE_OFFICERS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      activeOfficerDetails
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOfficerDetailsBtnValue = req.body.activeDirectors;
    if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(ACTIVE_OFFICERS_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: "Update the director details",
        pageHeading: "Update officers - File a confirmation statement",
      });
    } else {
      const activeOfficerDetails: ActiveOfficerDetails = req.sessionCookie[sessionCookieConstants.ACTIVE_OFFICER_DETAILS_KEY];
      return res.render(Templates.ACTIVE_OFFICERS, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        officerErrorMsg: OFFICER_DETAILS_ERROR,
        templateName: Templates.ACTIVE_OFFICERS,
        activeOfficerDetails
      });
    }
  } catch (e) {
    return next(e);
  }
};
