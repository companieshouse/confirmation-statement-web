import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO
    // const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    // const officers: CompanyOfficer[] = await getActiveOfficersDetailsData(companyNumber);

    return res.redirect(urlUtils.getUrlToPath("TODO", req));

  } catch (e) {
    return next(e);
  }
};
