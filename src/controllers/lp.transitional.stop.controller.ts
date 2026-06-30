import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { Templates } from "../types/template.paths";
import { FEATURE_FLAG_LP_REFORM_DATE } from "../utils/properties";
import { addDayToDateString } from "../utils/date";
import { DMMMMYYYY_DATE_FORMAT, COMPANY_PROFILE_SESSION_KEY } from "../utils/constants";

export const get = (req: Request, res: Response, next: NextFunction) => {
    try {
        let sessionCompany = getCompanyProfileFromSession(req);

        // Some tests/mocks set the company profile directly on the session extra data
        // rather than via the session util mock. Attempt a fallback to read it
        // directly from the session to make tests more robust.
        if (!sessionCompany && req.session && typeof (req.session as any).getExtraData === "function") {
            sessionCompany = (req.session as any).getExtraData(COMPANY_PROFILE_SESSION_KEY) as CompanyProfile;
        }

        if (!sessionCompany) {
            return next(new Error(`Invalid company for LP transitional stop screen`));
        }

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
