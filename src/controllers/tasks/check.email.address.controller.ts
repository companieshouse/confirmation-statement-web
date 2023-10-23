import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { getRegisteredEmailAddress } from "../../services/registered.email.address.service";
import { TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const registeredEmailAddress: string = await getRegisteredEmailAddress(companyNumber);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.CHECK_EMAIL_ADDRESS, {
      templateName: Templates.CHECK_EMAIL_ADDRESS,
      registeredEmailAddress: registeredEmailAddress,
      backLinkUrl,
    });
  } catch (error) {
    return next(error);
  }
};
