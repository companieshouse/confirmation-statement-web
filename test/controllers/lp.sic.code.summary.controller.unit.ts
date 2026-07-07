import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import {
    REVIEW_PATH,
    LP_REVIEW_PATH,
    LP_SIC_CODE_SUMMARY_PATH,
    urlParams,
    LP_CHECK_YOUR_ANSWER_PATH,
    LP_CS_DATE_PATH,
} from "../../src/types/page.urls";
import * as limitedPartnershipUtils from "../../src/utils/limited.partnership";
import * as sessionAcspUtils from "../../src/utils/session.acsp";
import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import * as sicCodeService from "../../src/services/sic.code.service";
import { getCompanyProfileFromSession } from "../../src/utils/session";
import { resetReviewCheckboxes } from "../../src/utils/confirmation/limited.partnership.confirmation";
import { getSicCodeSummaryList } from "../../src/controllers/lp.sic.code.summary.controller";

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = LP_SIC_CODE_SUMMARY_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const mockSicCodes = [
    {
        sic_code: "10001",
        sic_description: "Test 1",
    },
    {
        sic_code: "10002",
        sic_description: "Test 2",
    },
    {
        sic_code: "10003",
        sic_description: "Test 3",
    },
    {
        sic_code: "10004",
        sic_description: "Test 4",
    },
    {
        sic_code: "10005",
        sic_description: "Test 5",
    },
];

jest.mock("../../src/services/company.profile.service", () => ({
    getCompanyProfile: jest.fn(),
}));

jest.mock("../../src/utils/confirmation/limited.partnership.confirmation", () => ({
    sendLimitedPartnershipTransactionUpdate: jest.fn().mockResolvedValue(undefined),
    resetReviewCheckboxes: jest.fn(),
}));
const mockResetReviewCheckboxes = resetReviewCheckboxes as jest.Mock;

jest.mock("../../src/utils/session");
const mockGetCompanyProfileFromSession = getCompanyProfileFromSession as jest.Mock;
let session: Session;
let req: Partial<Request>;

describe("Controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.setTimeout(15000);
        jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(true);
        jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
            changeConfirmationStatementDate: false,
            beforeYouFileCheck: true,
            newConfirmationDate: null,
            confirmAllInformationCheck: false,
            confirmLawfulActionsCheck: false,
            sicCodes: [
                { sic_code: "70001", sic_description: "Description 1" },
                { sic_code: "70002", sic_description: "Description 2" },
                { sic_code: "70003", sic_description: "Description 3" },
                { sic_code: "70005", sic_description: "Description 5" },
            ],
        });

        session = new Session();
        session.data = {
            extra_data: {
                company_profile: {
                    sicCodes: ["70001", "70002", "70003"],
                },
            },
        };

        middlewareMocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
            req.session = session;
            return next();
        });

        mockGetCompanyProfileFromSession.mockReturnValue({
            companyName: "Test Limited Partnership",
            companyNumber: "LP123456",
            confirmationStatement: {
                nextMadeUpTo: "2999-09-01",
            },
            sicCodes: ["70001", "70002", "70003"],
        });
    });

    it("should return SIC Code Check and Confirm page", async () => {
        const response = await request(app).get(URL);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Check the partnership&#39;s nature of business");
        expect(response.text).toContain('<div class="govuk-summary-list__key">70001</div>');
        expect(response.text).toContain('<div class="govuk-summary-list__key">70002</div>');
        expect(response.text).toContain('<div class="govuk-summary-list__key">70003</div>');
        expect(response.text).toContain("Add a new nature of business");
    });

    it("should return SIC Code Check and Confirm page with 0 Sic Codes associated", async () => {
        jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
            changeConfirmationStatementDate: false,
            beforeYouFileCheck: true,
            newConfirmationDate: null,
            confirmAllInformationCheck: false,
            confirmLawfulActionsCheck: false,
            sicCodes: [],
        });

        mockGetCompanyProfileFromSession.mockReturnValue({
            companyName: "Test Limited Partnership",
            companyNumber: "LP123456",
            confirmationStatement: {
                nextMadeUpTo: "2999-09-01",
            },
            sicCodes: [],
        });

        const response = await request(app).get(URL);

        expect(response.status).toBe(200);
        expect(response.text).toContain("Check the partnership&#39;s nature of business");
        expect(response.text).toContain("There are no SIC codes registered for this limited partnership.");
        expect(response.text).toContain("You only need to provide SIC codes if the nature of business has changed.");
        expect(response.text).not.toContain('<div class="govuk-summary-list__key">');
        expect(response.text).toContain("Add a new nature of business");
        expect(response.text).not.toContain("Add a SIC code. A limited partnership must have at least one SIC code.");
    });

    it("should add a valid SIC code", async () => {
        await request(app).post(`${URL}/add`).send({ code: "70005", unsavedCodeList: "70001,70002,70003" }).expect(302);

        const response = await request(app).get(URL);

        expect(response.status).toBe(200);
        expect(response.text).toContain("70001");
        expect(response.text).toContain("70002");
        expect(response.text).toContain("70003");
        expect(response.text).toContain("70005");
    });

    it("should not add a duplicate SIC code", async () => {
        await request(app)
            .post(`${URL}/add`)
            .send({ code: "70003", unsavedCodeList: "70001,70002,70003,70005" })
            .expect(302);

        const response = await request(app).get(URL);
        const matches = response.text.match(/class="govuk-summary-list__key"[^>]*>\s*70003\s*<\/div>/g);

        expect(response.text).toContain("Check the partnership&#39;s nature of business");
        expect(response.text).toContain("70003");
        expect(matches?.length).toBe(1);
    });

    it("should not add more than 4 SIC codes", async () => {
        const response = await request(app)
            .post(`${URL}/add`)
            .send({ code: "70006", unsavedCodeList: "70001,70002,70003,70005" });

        expect(response.text).not.toContain('<div class="govuk-summary-list__value">70006</div>');
    });

    it("should hide the add sic code section", async () => {
        const response = await request(app)
            .post(`${URL}/add`)
            .send({ code: "70007", unsavedCodeList: "70001,70002,70003,70005" });

        expect(response.text).not.toContain('<div class="govuk-summary-list__value">70007</div>');
        expect(response.text).not.toContain("Add a new SIC code");
    });

    it("should remove a valid SIC code and redirect", async () => {
        const response = await request(app)
            .post(`${URL}/70002/remove?lang=en`)
            .send({ unsavedCodeList: "70001,70002,70003,70005" });

        expect(response.text).toContain('<div class="govuk-summary-list__key">70001</div>');
        expect(response.text).not.toContain('<div class="govuk-summary-list__key">70002</div>');
        expect(response.text).toContain('<div class="govuk-summary-list__key">70003</div>');
        expect(response.text).toContain('<div class="govuk-summary-list__key">70005</div>');
    });

    it("should remove a last SIC code, redirect and display message", async () => {
        const response = await request(app).post(`${URL}/70002/remove?lang=en`).send({ unsavedCodeList: "70002" });

        expect(response.text).not.toContain('<div class="govuk-summary-list__key">70002</div>');
        expect(response.text).toContain("You have removed all the SIC codes for this limited partnership.");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});

describe("SIC code summary post tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(true);
        jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
            changeConfirmationStatementDate: true,
            beforeYouFileCheck: true,
            newConfirmationDate: null,
            confirmAllInformationCheck: false,
            confirmLawfulActionsCheck: false,
            sicCodes: [
                { sic_code: "70001", sic_description: "Description 1" },
                { sic_code: "70002", sic_description: "Description 2" },
                { sic_code: "70003", sic_description: "Description 3" },
                { sic_code: "70005", sic_description: "Description 5" },
            ],
        });

        mockGetCompanyProfileFromSession.mockReturnValue({
            companyName: "Test LP",
            companyNumber: COMPANY_NUMBER,
            sicCodes: [],
        });

        req = {
            session: {} as Session,
            query: {},
            params: {
                companyNumber: COMPANY_NUMBER,
                transactionId: TRANSACTION_ID,
                submissionId: SUBMISSION_ID,
            },
            originalUrl: URL,
        };
    });

    it("should redirect to review page when valid SIC codes present", async () => {
        const response = await request(app).post(`${URL}/save`).send({ unsavedCodeList: "70001,70002,70003,70005" });

        const reviewPath = LP_REVIEW_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
            .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
            .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(reviewPath);
        expect(mockResetReviewCheckboxes).toHaveBeenCalled();
    });

    it("should redirect to review page when valid SIC codes 0 present", async () => {
        const response = await request(app).post(`${URL}/save`).send({ unsavedCodeList: "" });

        const reviewPath = LP_REVIEW_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
            .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
            .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

        expect(response.status).toBe(302);
        expect(response.text).not.toContain('<div class="govuk-summary-list__key">');
        expect(response.headers.location).toBe(reviewPath);
        expect(mockResetReviewCheckboxes).toHaveBeenCalled();
    });

    it("should redirect to review page when valid SIC codes present and BODY journey", async () => {
        jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(false);

        const response = await request(app).post(`${URL}/save`).send({ unsavedCodeList: "70001,70002,70003,70005" });

        const reviewPath = REVIEW_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
            .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
            .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(reviewPath);
        expect(mockResetReviewCheckboxes).toHaveBeenCalled();
    });

    it("should redirect to Check Your Answer page when back button clicked and confirmation statement date has changed", async () => {
        jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
            changeConfirmationStatementDate: true,
            beforeYouFileCheck: true,
            newConfirmationDate: null,
            confirmAllInformationCheck: false,
            confirmLawfulActionsCheck: false,
            sicCodes: [],
        });

        const response = await request(app).get(URL);

        const backPath = LP_CHECK_YOUR_ANSWER_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
            .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
            .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

        expect(response.text).toContain(backPath);
    });

    it("should redirect to Check Your Answer page when back button clicked and confirmation statement date has NOT changed", async () => {
        jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
            changeConfirmationStatementDate: false,
            beforeYouFileCheck: true,
            newConfirmationDate: null,
            confirmAllInformationCheck: false,
            confirmLawfulActionsCheck: false,
            sicCodes: [],
        });

        const response = await request(app).get(URL);

        const backPath = LP_CS_DATE_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
            .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
            .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

        expect(response.text).toContain(backPath);
    });

    it("should return an empty array when no SIC codes are supplied", () => {
        const result = getSicCodeSummaryList(req, "en", []);

        expect(result).toEqual([]);
    });

    it("should use the fallback description for unknown SIC codes", () => {
        const result = getSicCodeSummaryList(req, "en", ["99999"]);

        expect(result).toEqual([
            expect.objectContaining({
                sicCode: {
                    code: "99999",
                    description: "No Description Found.",
                },
            }),
        ]);
    });

    it("returns an empty array when there are no available SIC codes in session", () => {
        jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
            sicCodes: [],
        } as any);

        const result = getSicCodeSummaryList(req, "en", ["70001"]);

        expect(result).toEqual([]);
    });
});

describe("validateSicCodes", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should return error for empty list", () => {
        const result = sicCodeService.validateSicCodes([], 1, mockSicCodes);
        expect(result.minError).toBe(true);
        expect(result.maxError).toBe("Add a SIC code. A limited partnership must have at least one SIC code.");
    });

    it("should allow when company has 0 SIC codes associated and empty list", () => {
        const result = sicCodeService.validateSicCodes([], 0, mockSicCodes);

        expect(result.maxError).toBeUndefined();
        expect(result.invalidError).toBeUndefined();
        expect(result.duplicateError).toBeUndefined();
    });

    it("should return error for invalid SIC codes", () => {
        const result = sicCodeService.validateSicCodes(["jibberish"], 1, mockSicCodes);
        expect(result.invalidError).toBe("Invalid SIC code(s) entered. Please enter a Valid SIC code.");
    });

    it("should return error for more than 4 codes", () => {
        const result = sicCodeService.validateSicCodes(["10001", "10002", "10003", "10004", "10005"], 5, mockSicCodes);
        expect(result.maxError).toBe(
            "Remove SIC code(s). A limited partnership can only have a maximum of 4 SIC codes."
        );
    });

    it("should return error for duplicate codes", () => {
        const result = sicCodeService.validateSicCodes(["10001", "10002", "10001"], 3, mockSicCodes);
        expect(result.duplicateError).toBe(
            "Remove duplicate SIC codes. A limited partnership can not have duplicate SIC codes."
        );
    });

    it("should return multiple errors if multiple rules are violated", () => {
        const result = sicCodeService.validateSicCodes(
            ["10001", "10001", "10002", "10003", "10004", "10005"],
            5,
            mockSicCodes
        );
        expect(result.invalidError).toBeUndefined();
        expect(result.maxError).toBe(
            "Remove SIC code(s). A limited partnership can only have a maximum of 4 SIC codes."
        );
        expect(result.duplicateError).toBe(
            "Remove duplicate SIC codes. A limited partnership can not have duplicate SIC codes."
        );
    });

    it("should return no errors for valid input", () => {
        const result = sicCodeService.validateSicCodes(["10001", "10002", "10003"], 3, mockSicCodes);
        expect(result.maxError).toBeUndefined();
        expect(result.duplicateError).toBeUndefined();
        expect(result.invalidError).toBeUndefined();
    });
});

describe("SicCode Session Errors", () => {
    let mockSetExtraData: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(limitedPartnershipUtils, "isACSPJourney").mockReturnValue(true);

        jest.spyOn(sessionAcspUtils, "getAcspSessionData").mockReturnValue({
            changeConfirmationStatementDate: true,
            beforeYouFileCheck: true,
            newConfirmationDate: null,
            confirmAllInformationCheck: false,
            confirmLawfulActionsCheck: false,
            sicCodes: [
                { sic_code: "70001", sic_description: "Description 1" },
                { sic_code: "70002", sic_description: "Description 2" },
                { sic_code: "70003", sic_description: "Description 3" },
                { sic_code: "70004", sic_description: "Description 4" },
                { sic_code: "70005", sic_description: "Description 5" },
                { sic_code: "70006", sic_description: "Description 6" },
            ],
        });

        mockGetCompanyProfileFromSession.mockReturnValue({
            companyName: "Test LP",
            companyNumber: COMPANY_NUMBER,
            sicCodes: ["70001"],
        });

        mockSetExtraData = jest.fn();
        middlewareMocks.mockSessionMiddleware.mockImplementation((req, res, next) => {
            req.session = {
                setExtraData: mockSetExtraData,
                getExtraData: jest.fn().mockReturnValue({}),
            } as any;
            return next();
        });
    });

    it("should store session errors when invalid SIC code is submitted", async () => {
        const response = await request(app).post(`${URL}/save`).send({ unsavedCodeList: "INVALIDCODE" });

        const redirectUrl = LP_SIC_CODE_SUMMARY_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
            .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
            .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(redirectUrl);

        expect(mockSetExtraData).toHaveBeenCalledWith("SIC_CODE_ERRORS", [
            { text: "Invalid SIC code(s) entered. Please enter a Valid SIC code." },
        ]);
        expect(mockResetReviewCheckboxes).not.toHaveBeenCalled();
    });

    it("should store session errors when duplicate SIC code is submitted", async () => {
        const validate = jest.spyOn(sicCodeService, "validateSicCodes").mockReturnValue({
            duplicateError: "Remove duplicate SIC codes. A limited partnership can not have duplicate SIC codes.",
            invalidError: undefined,
            maxError: undefined,
        });

        const response = await request(app).post(`${URL}/save`).send({ code: "70001", unsavedCodeList: "70001" });

        expect(response.status).toBe(302);

        expect(mockSetExtraData).toHaveBeenCalledWith("SIC_CODE_ERRORS", [
            { text: "Remove duplicate SIC codes. A limited partnership can not have duplicate SIC codes." },
        ]);

        validate.mockRestore();
        expect(mockResetReviewCheckboxes).not.toHaveBeenCalled();
    });

    it("should store session errors when empty SIC code is submitted", async () => {
        const response = await request(app).post(`${URL}/save`).send({ unsavedCodeList: "" });

        expect(response.status).toBe(302);

        expect(mockSetExtraData).toHaveBeenCalledWith("sic_code_session", []);

        expect(mockSetExtraData).toHaveBeenCalledWith("SIC_CODE_ERRORS", [
            { text: "Add a SIC code. A limited partnership must have at least one SIC code." },
        ]);
        expect(mockResetReviewCheckboxes).not.toHaveBeenCalled();
    });

    it("should store session errors when more than 4 SIC codes are submitted", async () => {
        const response = await request(app)
            .post(`${URL}/save`)
            .send({ unsavedCodeList: "70001, 70002, 70003, 70004, 70005" });

        expect(response.status).toBe(302);

        expect(mockSetExtraData).toHaveBeenCalledWith("SIC_CODE_ERRORS", [
            { text: "Remove SIC code(s). A limited partnership can only have a maximum of 4 SIC codes." },
        ]);
        expect(mockResetReviewCheckboxes).not.toHaveBeenCalled();
    });
});
