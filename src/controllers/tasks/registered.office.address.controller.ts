import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, WRONG_RO_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { RADIO_BUTTON_VALUE, REGISTERED_OFFICE_ADDRESS_ERROR, SECTIONS } from "../../utils/constants";
import {
  SectionStatus
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { formatAddressForDisplay, formatRegisteredOfficeAddress } from "../../utils/format";
import { isRadioButtonValueValid } from "../../validators/radio.button.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    const registeredOfficeAddress = formatAddressForDisplay(formatRegisteredOfficeAddress(companyProfile.registeredOfficeAddress));
    return res.render(Templates.REGISTERED_OFFICE_ADDRESS, {
      templateName: Templates.REGISTERED_OFFICE_ADDRESS,
      backLinkUrl,
      registeredOfficeAddress
    });
  } catch (error) {
    return next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roaButtonValue = req.body.registeredOfficeAddress;
    if (!isRadioButtonValueValid(roaButtonValue)) {
      return next(new Error("No valid radio button value in request"));
    }
    if (roaButtonValue === RADIO_BUTTON_VALUE.YES || roaButtonValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (roaButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.NOT_CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(WRONG_RO_PATH, req));
    }

    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const registeredOfficeAddress = formatAddressForDisplay(formatRegisteredOfficeAddress(companyProfile.registeredOfficeAddress));
    return res.render(Templates.REGISTERED_OFFICE_ADDRESS, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      roaErrorMsg: REGISTERED_OFFICE_ADDRESS_ERROR,
      templateName: Templates.REGISTERED_OFFICE_ADDRESS,
      registeredOfficeAddress
    });
  } catch (e) {
    return next(e);
  }
};
