import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { ACTIVE_DIRECTORS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { OFFICER_DETAILS_ERROR, RADIO_BUTTON_VALUE, sessionCookieConstants } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveDirectorDetails } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getActiveDirectorDetailsData, formatOfficerDetails } from "../../services/active.officer.details.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerDetails: ActiveDirectorDetails = await getActiveDirectorDetailsData(session, companyNumber);
    const activeDirectorDetails = formatOfficerDetails(officerDetails);
    req.sessionCookie[sessionCookieConstants.ACTIVE_DIRECTOR_DETAILS_KEY] = activeDirectorDetails;

    return res.render(Templates.ACTIVE_DIRECTORS, {
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      activeDirectorDetails
    });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeDirectorDetailsBtnValue = req.body.activeDirectors;
    if (activeDirectorDetailsBtnValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (activeDirectorDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: "Update the director details",
        pageHeading: "Update officers - File a confirmation statement",
      });
    } else {
      const activeDirectorDetails: ActiveDirectorDetails = req.sessionCookie[sessionCookieConstants.ACTIVE_DIRECTOR_DETAILS_KEY];
      return res.render(Templates.ACTIVE_DIRECTORS, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        officerErrorMsg: OFFICER_DETAILS_ERROR,
        templateName: Templates.ACTIVE_DIRECTORS,
        activeDirectorDetails
      });
    }
  } catch (e) {
    return next(e);
  }
};
