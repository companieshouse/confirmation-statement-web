import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfileFromSession } from "../utils/session";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionCompany = getCompanyProfileFromSession(req);
        const companyNumber = sessionCompany?.companyNumber;
        if (!companyNumber) {
            return next(new Error(`Invalid company number for LP stop screen`));
        }
        const company: CompanyProfile = sessionCompany;
        const forwardUrl =
            "/confirmation-statement/confirm-company?companyNumber={companyNumber}&backLink=/confirmation-statement/";
        const companyLookupUrl = `/company-lookup/search?forward=${encodeURIComponent(forwardUrl)}`;
        return res.render(Templates.LP_STOP_SCREEN, {
            company,
            templateName: Templates.LP_STOP_SCREEN,
            companyNumber,
            companyLookupUrl,
        });
    } catch (e) {
        return next(e);
    }
};
