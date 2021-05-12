import {NextFunction, Request, Response} from "express";
import { Templates } from "../types/template.paths";

import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {createConfirmationStatement} from "../services/confirmation.statement.service";
import {Session} from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response) => {
  const company: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);

  return res.render(Templates.CONFIRM_COMPANY, { company });
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
    const transactionId: string = "";
    const session: Session = req.session as Session;
    await createConfirmationStatement(session, transactionId);
    next();
};
