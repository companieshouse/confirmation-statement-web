import { NextFunction, Request, Response } from "express";
import {
  TASK_LIST_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Templates } from "../../types/template.paths";
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
    const naturalSecretaryList = formatSecretaryList(officers);
    const naturalDirectorList = [{
      foreName1: "Kyrie",
      surname: "IRVING",
      occupation: "Director",
      nationality: "British",
      dateOfBirth: "1 January 1988",
      dateOfAppointment: "20 June 2019",
      countryOfResidence: "United Kingdom",
      serviceAddress: "2 Nets Way, Newcastle, NE2 3BB",
      residentialAddress: "2 Nets Way, Newcastle, NE2 3BB"
    }];

    return res.render(Templates.ACTIVE_OFFICERS_DETAILS, {
      templateName: Templates.ACTIVE_OFFICERS_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      naturalSecretaryList,
      naturalDirectorList,
    });
  } catch (e) {
    return next(e);
  }
};
