import { Request, Response } from "express";
import request from "supertest";
import { Session } from "@companieshouse/node-session-handler";
import { EligibilityStatusCode } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import app from "../../src/app";
import { validateIntegratedJourney } from "../../src/middleware/integrated.limited.partnership.validation.middleware";
import { checkEligibility } from "../../src/services/eligibility.service";
import { getTransaction } from "../../src/services/transaction.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { LP_BEFORE_YOU_FILE_PATH, urlParams } from "../../src/types/page.urls";
import { Templates } from "../../src/types/template.paths";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE, LIMITED_PARTNERSHIP_SUBTYPES } from "../../src/utils/constants";
import {
    isLimitedPartnershipFeatureFlagEnabled,
    isCompanyTypePermittedForLimitedPartnerships,
} from "../../src/utils/feature.flag";
import middlewareMocks from "../mocks/all.middleware.mock";

jest.mock("../../src/services/eligibility.service");
jest.mock("../../src/utils/feature.flag");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/transaction.service", () => ({
    getTransaction: jest.fn(),
}));

const mockIsLimitedPartnershipFeatureFlagEnabled = isLimitedPartnershipFeatureFlagEnabled as jest.Mock;
const mockIsCompanyTypePermittedForLimitedPartnerships = isCompanyTypePermittedForLimitedPartnerships as jest.Mock;
const mockCheckEligibility = checkEligibility as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const FEATURE_FLAG_LP_REFORM_DATE = "2026-01-01" as string;
const FEATURE_FLAG_LP_INTEGRATED_JOURNEY_PERMITTED_TYPES = ["limited-partnership"];

const ACSP_NUMBER = "TSA001";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL_LP_BEFORE = LP_BEFORE_YOU_FILE_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const TEST_COMPANY: CompanyProfile = {
    company_number: COMPANY_NUMBER,
    type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
    subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
};

const req: Request = { query: { companyNumber: COMPANY_NUMBER } } as Request;
const res: Response = {} as Response;
const mockStatus = jest.fn() as jest.Mock;
const mockRender = jest.fn() as jest.Mock;
mockRender.mockImplementation((..._args: any) => {
    return;
});
mockStatus.mockImplementation((_view: string, _options?: object) => {
    return { render: mockRender };
});
res.status = mockStatus;
const next = jest.fn();

middlewareMocks.mockValidateIntegratedJourney.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    validateIntegratedJourney(req, res, next);
});

function addSessionToRequest(gciReturnUrl: string, hasAcsp: boolean = true) {
    const session = new Session();
    session.data = {
        extra_data: {
            company_profile: {
                company_number: COMPANY_NUMBER,
                type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
                subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
            },
        },
    };
    if (gciReturnUrl) {
        session.data.extra_data.gci_return_url = gciReturnUrl;
    }
    if (hasAcsp) {
        session.data.signin_info = { acsp_number: ACSP_NUMBER };
    }
    req.session = session;
}

describe("start Integrated Limited Partnership Journey validation middleware tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsLimitedPartnershipFeatureFlagEnabled.mockReset();
        mockIsCompanyTypePermittedForLimitedPartnerships.mockReset();
        mockCheckEligibility.mockReset();
        mockGetCompanyProfile.mockReset();
    });

    it("validateIntegratedJourney do nothing with no gci_return_url on session", async () => {
        addSessionToRequest();

        await validateIntegratedJourney(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it(
        "validateIntegratedJourney pass with company type in FEATURE_FLAG_LP_INTEGRATED_JOURNEY_PERMITTED_TYPES, " +
            "Eligibility Checks OK, Today after FEATURE_FLAG_LP_REFORM_DATE, logged in as ACSP",
        async () => {
            addSessionToRequest("http://chs.local/company/11456298");

            mockIsLimitedPartnershipFeatureFlagEnabled.mockReturnValueOnce(true);
            mockIsCompanyTypePermittedForLimitedPartnerships.mockReturnValueOnce(true);
            mockCheckEligibility.mockReturnValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
            mockGetCompanyProfile.mockReturnValueOnce(TEST_COMPANY);

            await validateIntegratedJourney(req, res, next);

            expect(next).toHaveBeenCalled();
        }
    );

    it("validateIntegratedJourney to failure page NOT logged in as ACSP", async () => {
        addSessionToRequest("http://chs.local/company/11456298", false);

        mockIsLimitedPartnershipFeatureFlagEnabled.mockReturnValueOnce(true);
        mockIsCompanyTypePermittedForLimitedPartnerships.mockReturnValueOnce(true);
        mockCheckEligibility.mockReturnValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
        mockGetCompanyProfile.mockReturnValueOnce(TEST_COMPANY);

        await validateIntegratedJourney(req, res, next);

        verifyRenderOfflinePage();
    });

    it("validateIntegratedJourney to failure page Company type not limited-partnership", async () => {
        addSessionToRequest("http://chs.local/company/11456298");

        mockIsLimitedPartnershipFeatureFlagEnabled.mockReturnValueOnce(true);
        mockIsCompanyTypePermittedForLimitedPartnerships.mockReturnValueOnce(false);
        mockCheckEligibility.mockReturnValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
        mockGetCompanyProfile.mockReturnValueOnce(TEST_COMPANY);

        await validateIntegratedJourney(req, res, next);

        verifyRenderOfflinePage();
    });

    it("validateIntegratedJourney to failure page Limited Partnership Reform not active yet", async () => {
        addSessionToRequest("http://chs.local/company/11456298");

        mockIsLimitedPartnershipFeatureFlagEnabled.mockReturnValueOnce(false);
        mockIsCompanyTypePermittedForLimitedPartnerships.mockReturnValueOnce(true);
        mockCheckEligibility.mockReturnValueOnce(EligibilityStatusCode.COMPANY_VALID_FOR_SERVICE);
        mockGetCompanyProfile.mockReturnValueOnce(TEST_COMPANY);

        await validateIntegratedJourney(req, res, next);
        verifyRenderOfflinePage();
    });

    it("validateIntegratedJourney to failure page Eligibility Checks Fail", async () => {
        addSessionToRequest("http://chs.local/company/11456298");

        mockIsLimitedPartnershipFeatureFlagEnabled.mockReturnValueOnce(true);
        mockIsCompanyTypePermittedForLimitedPartnerships.mockReturnValueOnce(true);
        mockCheckEligibility.mockReturnValueOnce(EligibilityStatusCode.INVALID_COMPANY_TYPE_USE_WEB_FILING);
        mockGetCompanyProfile.mockReturnValueOnce(TEST_COMPANY);

        await validateIntegratedJourney(req, res, next);

        verifyRenderOfflinePage();
    });

    function verifyRenderOfflinePage() {
        expect(next).not.toHaveBeenCalled();
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockRender.mock.calls[0][0]).toEqual(Templates.SERVICE_OFFLINE_MID_JOURNEY);
    }
});
