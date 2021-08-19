import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { ACTIVE_DIRECTORS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import {
  DIRECTOR_DETAILS_ERROR,
  RADIO_BUTTON_VALUE,
  SECTIONS,
  sessionCookieConstants,
  WRONG_DETAILS_UPDATE_DIRECTOR,
  WRONG_DETAILS_UPDATE_OFFICERS } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import {
  ActiveDirectorDetails,
  SectionStatus } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getActiveDirectorDetailsData, formatDirectorDetails } from "../../services/active.director.details.service";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const directorDetails: ActiveDirectorDetails = await getActiveDirectorDetailsData(session, companyNumber);
    const activeDirectorDetails = formatDirectorDetails(directorDetails);
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

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeDirectorDetailsBtnValue = req.body.activeDirectors;
    if (activeDirectorDetailsBtnValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.ACTIVE_DIRECTOR, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (activeDirectorDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ACTIVE_DIRECTOR, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_DIRECTOR,
        pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
      });
    } else {
      const activeDirectorDetails: ActiveDirectorDetails = req.sessionCookie[sessionCookieConstants.ACTIVE_DIRECTOR_DETAILS_KEY];
      return res.render(Templates.ACTIVE_DIRECTORS, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        directorErrorMsg: DIRECTOR_DETAILS_ERROR,
        templateName: Templates.ACTIVE_DIRECTORS,
        activeDirectorDetails
      });
    }
  } catch (e) {
    return next(e);
  }
};
