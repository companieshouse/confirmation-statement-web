import { Templates } from "../../types/template.paths";
import { Request, Response } from "express";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { getUrlWithCompanyNumber } from "../../utils/url";

export const get = (req: Request, res: Response) => {
  const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
  const backLinkUrl = getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
  return res.render(Templates.ACTIVE_PSCS, { backLinkUrl });
};
