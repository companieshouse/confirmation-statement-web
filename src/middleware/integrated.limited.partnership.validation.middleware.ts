import { NextFunction, Request, Response } from "express";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { EligibilityStatusCode } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { isAuthorisedAgent } from "@companieshouse/ch-node-utils";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../services/company.profile.service";
import { checkEligibility } from "../services/eligibility.service";
import { Templates } from "../types/template.paths";
import { isIntegratedJourney } from "../utils/limited.partnership";
import { logger } from "../utils/logger";
import {
    isLimitedPartnershipFeatureFlagEnabled,
    isCompanyTypePermittedForLimitedPartnerships,
} from "../utils/feature.flag";

export const validateIntegratedJourney = async (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as Session;

    if (!req.query.companyNumber) {
        logger.error("Parameter companyNumber missing for call to integrated-entry");
        return renderServiceOfflinePage(res);
    }

    if (!session || !isIntegratedJourney(session)) return next();

    if (!isAuthorisedAgent(session)) {
        return renderServiceOfflinePage(res);
    }

    if (!isLimitedPartnershipFeatureFlagEnabled()) {
        return renderServiceOfflinePage(res);
    }

    const company: CompanyProfile = await getCompanyProfile(req.query.companyNumber as string);

    if (!isCompanyTypePermittedForLimitedPartnerships(company)) {
        return renderServiceOfflinePage(res);
    }

    const eligibilityStatusCode: EligibilityStatusCode = await checkEligibility(session, company.companyNumber);

    if (EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE !== eligibilityStatusCode) {
        return renderServiceOfflinePage(res);
    }

    return next();
};

function renderServiceOfflinePage(res: Response) {
    return res
        .status(400)
        .render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
}
