import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { OFFICER_DETAILS_ERROR, RADIO_BUTTON_VALUE } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficerDetailsData } from "../../services/active.officer.details.service";
import { formatTitleCase } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = getCompanyNumber(req);
    const session: Session = req.session as Session;
    const activeOfficerDetails: ActiveOfficerDetails = await getActiveOfficerDetailsData(session, companyNumber);
    activeOfficerDetails.foreName1 = formatTitleCase(activeOfficerDetails.foreName1);
    if (activeOfficerDetails.foreName2) {
      activeOfficerDetails.foreName2 = formatTitleCase(activeOfficerDetails.foreName2);
    }

    console.log("------------------>" + activeOfficerDetails.foreName1  + ", " + activeOfficerDetails.foreName2 + ", "  + activeOfficerDetails.surname);

    const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);

    return res.render(Templates.ACTIVE_OFFICERS, { backLinkUrl, activeOfficerDetails });
  } catch (e) {
    return next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOfficerButtonValue = req.body.activeDirectors;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];

    if (activeOfficerButtonValue === RADIO_BUTTON_VALUE.YES) {
      return res.redirect(urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber));
    } else {
      return res.render(Templates.ACTIVE_OFFICERS, {
        backLinkUrl: urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber),
        officerErrorMsg: OFFICER_DETAILS_ERROR,
        templateName: Templates.ACTIVE_OFFICERS
      });
    }
  } catch (e) {
    return next(e);
  }
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];
