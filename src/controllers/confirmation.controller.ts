import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { ACCOUNTS_SIGNOUT_PATH } from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { validCompanyProfile } from "../../test/mocks/lp.company.profile.mock";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const session = req.session as Session;
    const userEmail = session.data.signin_info?.user_profile?.email;
    const company: CompanyProfile = validCompanyProfile;
    return res.render(Templates.CONFIRMATION, {
      signoutURL: ACCOUNTS_SIGNOUT_PATH,
      referenceNumber: transactionId,
      userEmail, 
      company
    });
  } catch (e) {
    return next(e);
  }
};

