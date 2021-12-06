import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    // const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    // const officers: CompanyOfficer[] = await getActiveOfficersDetailsData(companyNumber);

    return res.redirect(urlUtils.getUrlToPath("TODO", req));


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
