import { NextFunction, Request, Response } from "express";
import { OFFICER_TYPE } from "../../utils/constants";
import { getActiveOfficersDetailsData } from "../../services/active.officers.details.service";
import { CORPORATE_DIRECTORS_PATH, CORPORATE_SECRETARIES_PATH, NATURAL_PERSON_DIRECTORS_PATH, NATURAL_PERSON_SECRETARIES_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { createAndLogError } from "../../utils/logger";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const officers: CompanyOfficer[] = await getActiveOfficersDetailsData(companyNumber);

    // if (officerTypeList.includes(OFFICER_TYPE.NATURAL_SECRETARY)){
    //   return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_SECRETARIES_PATH, req));
    // }
    // if (officerTypeList.includes(OFFICER_TYPE.CORPORATE_SECRETARIES)){
    //   return res.redirect(urlUtils.getUrlToPath(CORPORATE_SECRETARIES_PATH, req));
    // }
    // if (officerTypeList.includes(OFFICER_TYPE.NATURAL_DIRECTOR)){
    //   return res.redirect(urlUtils.getUrlToPath(NATURAL_PERSON_DIRECTORS_PATH, req));
    // }
    // if (officerTypeList.includes(OFFICER_TYPE.CORPORATE_DIRECTORS)){
    //   return res.redirect(urlUtils.getUrlToPath(CORPORATE_DIRECTORS_PATH, req));
    // }

  } catch (e) {
    return next(e);
  }
};
