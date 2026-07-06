import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { Templates } from "../types/template.paths";
import { FEATURE_FLAG_LP_REFORM_DATE } from "../utils/properties";
import { addDayToDateString } from "../utils/date";
import { DMMMMYYYY_DATE_FORMAT } from "../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
    try {
        let sessionCompany = getCompanyProfileFromSession(req);

        const company: CompanyProfile = sessionCompany;
        const companyNumber = company.companyNumber;

        const lpReformDatePlusOne = addDayToDateString(DMMMMYYYY_DATE_FORMAT, FEATURE_FLAG_LP_REFORM_DATE, 1);

        return res.render(Templates.LP_TRANSITIONAL_STOP_SCREEN, {
            company,
            templateName: Templates.LP_TRANSITIONAL_STOP_SCREEN,
            companyNumber,
            lpReformDatePlusOne,
        });
    } catch (e) {
        return next(e);
    }
};
