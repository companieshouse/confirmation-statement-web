import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, urlParams } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
    return res.render(Templates.REGISTERED_OFFICE_ADDRESS, {
      templateName: Templates.REGISTERED_OFFICE_ADDRESS,
      backLinkUrl });
  } catch (error) {
    return next(error);
  }
};

