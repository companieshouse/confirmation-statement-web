import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { CORPORATE_DIRECTORS_PATH, CORPORATE_SECRETARIES_PATH, NATURAL_PERSON_DIRECTORS_PATH, NATURAL_PERSON_SECRETARIES_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { RADIO_BUTTON_VALUE, SECRETARY_DETAILS_ERROR, WRONG_DETAILS_UPDATE_OFFICERS, WRONG_DETAILS_UPDATE_SECRETARY } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getActiveOfficersDetailsData } from "../../services/active.officers.details.service";
import { formatSecretaryList } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    const secretaryList = formatSecretaryList(officers);
    console.log(secretaryList);
    return res.render(Templates.NATURAL_PERSON_SECRETARIES, {
      templateName: Templates.NATURAL_PERSON_SECRETARIES,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      secretaryList
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
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    const natPersonSecretariesBtnValue = req.body.naturalPersonSecretaries;

    if (natPersonSecretariesBtnValue === RADIO_BUTTON_VALUE.YES || natPersonSecretariesBtnValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      let corpSecretary = false;
      let director = false;
      let corpDirector = false;
      officers.forEach(officer => {
        if (officer.role === "SECRETARY" && officer.isCorporate){
          corpSecretary = true;
        } else if (officer.role === "DIRECTOR" && !officer.isCorporate){
          director = true;
        } else if (officer.role === "DIRECTOR" && officer.isCorporate){
          corpDirector = true;
        }
      });

      if (corpSecretary){
        return res.redirect(urlUtils.getUrlToPath(CORPORATE_SECRETARIES_PATH, req));
      } else if (director){
        return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_DIRECTORS_PATH, req));
      } else if (corpDirector){
        return res.redirect(urlUtils.getUrlToPath(CORPORATE_DIRECTORS_PATH, req));
      }

      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (natPersonSecretariesBtnValue === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(NATURAL_PERSON_SECRETARIES_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_SECRETARY,
        pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
      });
    } else {
      const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
      const secretaryList = formatSecretaryList(officers);
      return res.render(Templates.NATURAL_PERSON_SECRETARIES, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        secretaryErrorMsg: SECRETARY_DETAILS_ERROR,
        templateName: Templates.NATURAL_PERSON_SECRETARIES,
        secretaryList
      });
    }
  } catch (e) {
    return next(e);
  }
};
