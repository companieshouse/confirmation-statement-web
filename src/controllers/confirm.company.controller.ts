import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import logger from "../utils/logger";

import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const get = async (req: Request, res: Response) => {
  const companyProfile: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);

  logger.info(JSON.stringify(companyProfile, null, 2));

  return res.render(Templates.CONFIRM_COMPANY);
};
