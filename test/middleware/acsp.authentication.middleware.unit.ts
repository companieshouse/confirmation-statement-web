import {
    LP_CHECK_YOUR_ANSWER_PATH,
    LP_BEFORE_YOU_FILE_PATH,
    TRADING_STATUS_PATH,
    urlParams,
} from "../../src/types/page.urls";
import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE, LIMITED_PARTNERSHIP_SUBTYPES } from "../../src/utils/constants";
import mockAuthenticationMiddleware from "../mocks/authentication.middleware.mock";
import mockSessionMiddleware from "../mocks/session.middleware.mock";
import mockCompanyAuthenticationMiddleware from "../mocks/company.authentication.middleware.mock";
import mockCsrfMiddleware from "../mocks/csrf.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getTransaction } from "../../src/services/transaction.service";
import { acspManageUsersAuthMiddleware, AuthOptions } from "@companieshouse/web-security-node";

jest.mock("../../src/services/transaction.service", () => ({
    getTransaction: jest.fn(),
}));

jest.mock("../../src/services/sic.code.service", () => ({
    getSicCodeCondensedList: jest.fn(),
}));

const ACSP_NUMBER = "TSA001";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL_LP_BEFORE = LP_BEFORE_YOU_FILE_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const URL_LP_CHECK = LP_CHECK_YOUR_ANSWER_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const URL_CS_JOURNEY = TRADING_STATUS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const mockAcspAuthReturnedFunction = jest.fn();
mockAcspAuthReturnedFunction.mockImplementation((_req, _res, next) => next());
const mockAcspManageUsersAuthMiddleware = acspManageUsersAuthMiddleware as jest.Mock;
mockAcspManageUsersAuthMiddleware.mockReturnValue(mockAcspAuthReturnedFunction);

const expectedAuthMiddlewareConfig: AuthOptions = {
    chsWebUrl: "http://chs.local",
    returnUrl: URL_LP_BEFORE,
    acspNumber: ACSP_NUMBER,
};

mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    const session: Session = new Session();
    session.data = {
        signin_info: {
            acsp_number: ACSP_NUMBER,
        },
        extra_data: {
            company_profile: {
                type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
                subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
            },
        },
    };
    req.session = session;
    return next();
});

describe("start ACSP authentication middleware tests", () => {
    beforeEach(() => {
        mockAuthenticationMiddleware.mockClear();
        mockSessionMiddleware.mockClear();
        mockCompanyAuthenticationMiddleware.mockClear();
        mockCsrfMiddleware.mockClear();
    });

    it("acspAuthenticationMiddleware should redirect to LP before you file page if user is ACSP member and LP type", async () => {
        setCompanyTypeAndAcspNumberInSession(
            LIMITED_PARTNERSHIP_COMPANY_TYPE,
            ACSP_NUMBER,
            LIMITED_PARTNERSHIP_SUBTYPES.LP
        );

        (getTransaction as jest.Mock).mockResolvedValue({
            id: TRANSACTION_ID,
        });

        const response = await request(app).get(URL_LP_BEFORE);

        expectToCallAcspAuthMiddlewareAndAcspAuthReturnedFunction(expectedAuthMiddlewareConfig);
        expect(response.text).toContain("Before you file the confirmation statement");
    });

    it("acspAuthenticationMiddleware should redirect to LP check your answer page if user is ACSP member and LP subtype", async () => {
        setCompanyTypeAndAcspNumberInSession(
            LIMITED_PARTNERSHIP_COMPANY_TYPE,
            ACSP_NUMBER,
            LIMITED_PARTNERSHIP_SUBTYPES.SLP
        );
        expectedAuthMiddlewareConfig.returnUrl = URL_LP_CHECK;
        const response = await request(app).get(URL_LP_CHECK);

        expectToCallAcspAuthMiddlewareAndAcspAuthReturnedFunction(expectedAuthMiddlewareConfig);
        expect(response.headers.location).toBe(
            "/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/confirmation-statement-date?lang=en"
        );
    });

    it("acspAuthenticationMiddleware should redirect to LP stop screen if user is non ACSP member", async () => {
        setCompanyTypeAndAcspNumberInSession(LIMITED_PARTNERSHIP_COMPANY_TYPE, "", LIMITED_PARTNERSHIP_SUBTYPES.LP);
        const response = await request(app).get(URL_LP_CHECK);

        expectToCallAcspAuthMiddlewareAndAcspAuthReturnedFunction(expectedAuthMiddlewareConfig);
        expect(response.headers.location).toBe("/confirmation-statement/acsp/must-be-authorised-agent");
    });

    it("acspAuthenticationMiddleware should redirect to LP stop screen if company profile is empty and user is non ACSP member ", async () => {
        setCompanyTypeAndAcspNumberInSession("", "");
        const response = await request(app).get(URL_LP_CHECK);

        expectToCallAcspAuthMiddlewareAndAcspAuthReturnedFunction(expectedAuthMiddlewareConfig);
        expect(response.headers.location).toBe("/confirmation-statement/acsp/must-be-authorised-agent");
    });

    it("acspAuthenticationMiddleware should redirect to service offline screen if company type is empty and user is ACSP member ", async () => {
        setCompanyTypeAndAcspNumberInSession("", ACSP_NUMBER);
        const response = await request(app).get(URL_LP_CHECK);

        expectToCallAcspAuthMiddlewareAndAcspAuthReturnedFunction(expectedAuthMiddlewareConfig);
        expect(response.text).toContain("Sorry, there is a problem with the service");
    });

    it("acspAuthenticationMiddleware should not be called if the URL is not part of ACSP journey and user is non ACSP member", async () => {
        setCompanyTypeAndAcspNumberInSession("ltd", "");
        const response = await request(app).get(URL_CS_JOURNEY);

        expect(mockAcspManageUsersAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
        expect(mockAcspAuthReturnedFunction).toHaveBeenCalled();
        expect(response.text).toContain("Is the trading status of shares correct?");
    });

    it("acspAuthenticationMiddleware should not be called if the URL is not part of ACSP journey and user is ACSP member", async () => {
        setCompanyTypeAndAcspNumberInSession("ltd", ACSP_NUMBER);
        const response = await request(app).get(URL_CS_JOURNEY);

        expectToCallAcspAuthMiddlewareAndAcspAuthReturnedFunction(expectedAuthMiddlewareConfig);
        expect(response.text).toContain("Is the trading status of shares correct?");
    });
});

function setCompanyTypeAndAcspNumberInSession(companyType: string, acspNumber: string, companySubtype?: string) {
    mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
        const session: Session = new Session();
        session.data = {
            signin_info: {
                acsp_number: acspNumber,
            },
            extra_data: {
                company_profile: {
                    type: companyType,
                    subtype: companySubtype,
                },
            },
        };
        req.session = session;
        return next();
    });
}

function expectToCallAcspAuthMiddlewareAndAcspAuthReturnedFunction(expectedAuthMiddlewareConfig: AuthOptions) {
    expect(mockAcspManageUsersAuthMiddleware).toHaveBeenCalledWith(expectedAuthMiddlewareConfig);
    expect(mockAcspAuthReturnedFunction).toHaveBeenCalled();
}
