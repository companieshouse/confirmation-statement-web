import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, CONFIRM_EMAIL_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { isEmailAddressValid } from "../../validators/email.validator";
import { EMAIL_ADDRESS_INVALID, NO_EMAIL_ADDRESS_SUPPLIED } from "../../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.PROVIDE_EMAIL_ADDRESS, {
      templateName: Templates.PROVIDE_EMAIL_ADDRESS,
      backLinkUrl,
    });
  } catch (error) {
    return next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const reaValue = req.body.registeredEmailAddress;
    let errorFound: string = "";
    if (!reaValue){
      errorFound = NO_EMAIL_ADDRESS_SUPPLIED;
    } else if (!isEmailAddressValid(reaValue)) {
      errorFound = EMAIL_ADDRESS_INVALID;
    }
    if (errorFound) {
      const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
      return res.render(Templates.PROVIDE_EMAIL_ADDRESS, {
        templateName: Templates.PROVIDE_EMAIL_ADDRESS,
        emailErrorMsg: errorFound,
        backLinkUrl,
      });
    }
    req.session?.setExtraData("entered-email-address", reaValue);
    return res.redirect(urlUtils.getUrlToPath(CONFIRM_EMAIL_PATH, req));
  } catch (error) {
    return next(error);
  }
};
