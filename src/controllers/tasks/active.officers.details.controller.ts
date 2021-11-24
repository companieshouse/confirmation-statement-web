import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { getActiveOfficersDetailsData } from "../../services/active.officers.details.service";
import { CORPORATE_DIRECTORS_PATH, CORPORATE_SECRETARIES_PATH, NATURAL_PERSON_DIRECTORS_PATH, NATURAL_PERSON_SECRETARIES_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officers: ActiveOfficerDetails[] = await getActiveOfficersDetailsData(session, transactionId, submissionId);
    let secretary = false;
    let corpSecretary = false;
    let director = false;
    let corpDirector = false;

    officers.forEach(officer => {
      if (officer.role === "SECRETARY" && !officer.isCorporate){
        secretary = true;
      } else if (officer.role === "SECRETARY" && officer.isCorporate){
        corpSecretary = true;
      } else if (officer.role === "DIRECTOR" && !officer.isCorporate){
        director = true;
      } else if (officer.role === "DIRECTOR" && officer.isCorporate){
        corpDirector = true;
      }
    });

    if (secretary){
      return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_SECRETARIES_PATH, req));
    } else if (corpSecretary){
      return res.redirect(urlUtils.getUrlToPath(CORPORATE_SECRETARIES_PATH, req));
    } else if (director){
      return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_DIRECTORS_PATH, req));
    } else if (corpDirector){
      return res.redirect(urlUtils.getUrlToPath(CORPORATE_DIRECTORS_PATH, req));
    }

  } catch (e) {
    return next(e);
  }
};
