import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { getRegisteredEmailAddress } from "../../services/registered.email.address.service";
import { CHANGE_EMAIL_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { RADIO_BUTTON_VALUE, CHECK_EMAIL_ADDRESS_ERROR, SECTIONS } from "../../utils/constants";
import {
  SectionStatus
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import {
  getRadioButtonInvalidValueErrorMessage,
  isRadioButtonValueValid
} from "../../validators/radio.button.validator";
import { getCompanyProfile } from "../../services/company.profile.service";


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

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const emailButtonValue = req.body.checkEmailAddress;
    if (!isRadioButtonValueValid(emailButtonValue)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(emailButtonValue)));
    }
    if (emailButtonValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.EMAIL, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (emailButtonValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      await sendUpdate(req, SECTIONS.EMAIL, SectionStatus.RECENT_FILING);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (emailButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.EMAIL, SectionStatus.NOT_CONFIRMED);
      const companyProfile = await getCompanyProfile(companyNumber);
      // set session data expected by rea service
      req.session?.setExtraData("companyNumber", companyProfile.companyNumber);
      req.session?.setExtraData("companyProfile", companyProfile);
      req.session?.setExtraData("registeredEmailAddress", await getRegisteredEmailAddress(companyNumber));
      req.session?.setExtraData("returnToConfirmationStatement", true); // flag to indicate journey started here
      // go to change email page within rea service
      return res.redirect(urlUtils.getUrlToPath(CHANGE_EMAIL_PATH, req));
    }

    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.CHECK_EMAIL_ADDRESS, {
      templateName: Templates.CHECK_EMAIL_ADDRESS,
      registeredEmailAddress: await getRegisteredEmailAddress(companyNumber),
      backLinkUrl,
      checkEmailErrorMsg: CHECK_EMAIL_ADDRESS_ERROR,
    });
  } catch (e) {
    return next(e);
  }
};
