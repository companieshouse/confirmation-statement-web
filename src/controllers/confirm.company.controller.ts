import { Request, Response } from "express";
import { Templates } from "../types/template.paths";

import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const get = async (req: Request, res: Response) => {
  const company: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);

  return res.render(Templates.CONFIRM_COMPANY, { company });
};
