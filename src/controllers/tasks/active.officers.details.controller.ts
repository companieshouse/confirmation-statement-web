import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { OFFICER_ROLE } from "../../utils/constants";
import { getActiveOfficersDetailsData } from "../../services/active.officers.details.service";
import { CORPORATE_DIRECTORS_PATH, CORPORATE_SECRETARIES_PATH, NATURAL_PERSON_DIRECTORS_PATH, NATURAL_PERSON_SECRETARIES_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    let containsSecretary = false;
    let containsCorpSecretary = false;
    let containsDirector = false;
    let containsCorpDirector = false;

    officers.forEach(officer => {
      if (officer.role === OFFICER_ROLE.SECRETARY) {
        officer.isCorporate ? containsCorpSecretary = true : containsSecretary = true;
      }
      if (officer.role === OFFICER_ROLE.DIRECTOR) {
        officer.isCorporate ? containsCorpDirector = true : containsDirector = true;
      }
    });

    if (containsSecretary) {return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_SECRETARIES_PATH, req));}
    if (containsCorpSecretary) {return res.redirect(urlUtils.getUrlToPath(CORPORATE_SECRETARIES_PATH, req));}
    if (containsDirector) {return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_DIRECTORS_PATH, req));}
    if (containsCorpDirector) {return res.redirect(urlUtils.getUrlToPath(CORPORATE_DIRECTORS_PATH, req));}

  } catch (e) {
    return next(e);
  }
};
