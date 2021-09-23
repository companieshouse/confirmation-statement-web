import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, REGISTERED_OFFICE_ADDRESS_PATH, CHANGE_ROA_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { CompanyProfile, RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { RADIO_BUTTON_VALUE, REGISTERED_OFFICE_ADDRESS_ERROR, SECTIONS } from "../../utils/constants";
import {
  SectionStatus
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { formatTitleCase, formatAddressForDisplay } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    const registeredOfficeAddress = formatAddressForDisplay(formatAddress(companyProfile.registeredOfficeAddress));
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

    if (roaButtonValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (roaButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.ROA, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_RO, {
        backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
        taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req)
      });
    }

    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const registeredOfficeAddress = formatAddressForDisplay(formatAddress(companyProfile.registeredOfficeAddress));
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

const formatAddress = (address: RegisteredOfficeAddress): RegisteredOfficeAddress => {
  const addressClone: RegisteredOfficeAddress = JSON.parse(JSON.stringify(address));
  return {
    careOf: formatTitleCase(addressClone.careOf),
    poBox: formatTitleCase(addressClone.poBox),
    premises: formatTitleCase(addressClone.premises),
    addressLineOne: formatTitleCase(addressClone.addressLineOne),
    addressLineTwo: formatTitleCase(addressClone.addressLineTwo),
    locality: formatTitleCase(addressClone.locality),
    region: formatTitleCase(addressClone.region),
    country: formatTitleCase(addressClone.country),
    postalCode: addressClone.postalCode?.toUpperCase()
  };
};
