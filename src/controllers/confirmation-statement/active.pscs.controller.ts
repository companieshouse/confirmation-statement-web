import { Templates } from "../../types/template.paths";
import { Request, Response } from "express";
import { urlParams } from "../../types/page.urls";

export const get = (req: Request, res: Response) => {
  const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
  return res.render(Templates.ACTIVE_PSCS, { companyNumber: companyNumber });
};
