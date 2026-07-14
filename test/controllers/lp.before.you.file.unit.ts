import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import { Session } from "@companieshouse/node-session-handler";
import app from "../../src/app";
import { LP_BEFORE_YOU_FILE_PATH, CONFIRM_COMPANY_PATH, URL_QUERY_PARAM, urlParams } from "../../src/types/page.urls";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE, LIMITED_PARTNERSHIP_SUBTYPES } from "../../src/utils/constants";
import { getTransaction } from "../../src/services/transaction.service";
import { getCompanyProfileFromSession } from "../../src/utils/session";
import { isPaymentDue } from "../../src/utils/payments";
import * as urls from "../../src/types/page.urls";

jest.mock("../../src/services/transaction.service", () => ({
    getTransaction: jest.fn(),
}));

jest.mock("../../src/utils/payments", () => ({
    isPaymentDue: jest.fn(),
}));

jest.mock("../../src/utils/session", () => ({
    getCompanyProfileFromSession: jest.fn(),
}));

jest.mock("../../src/services/sic.code.service", () => ({
    getSicCodeCondensedList: jest.fn(),
}));

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = LP_BEFORE_YOU_FILE_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const ACSP_NUMBER = "TSA001";
const GCI_RETURN_URL = "http://chs.local/company/11456298";

describe("start before you file controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return acsp / limited partnership before you file page page", async () => {
        const response = await doGetPageTest(LIMITED_PARTNERSHIP_SUBTYPES.LP);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Before you file the confirmation statement");
        expect(response.text).toContain(
            "You will not be able to view or change limited partnership information (except for the SIC codes) as part of this filing."
        );

        // Check the Back link is the correct default value
        const regex = new RegExp(
            '<a href="' +
                CONFIRM_COMPANY_PATH +
                "\\?" +
                URL_QUERY_PARAM.COMPANY_NUM +
                "=" +
                COMPANY_NUMBER +
                '" class="govuk-back-link'
        );
        expect(response.text).toMatch(regex);
    });

    it("should return CS01 cost in the fee paragraph", async () => {
        (isPaymentDue as jest.Mock).mockReturnValue(true);
        const response = await doGetPageTest(LIMITED_PARTNERSHIP_SUBTYPES.LP);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("<strong>&pound;50</strong>");
    });

    it("should return acsp / limited partnership before you file page page, for Scottish Limited Parntership", async () => {
        const response = await doGetPageTest(LIMITED_PARTNERSHIP_SUBTYPES.SLP);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Before you file the confirmation statement");
        expect(response.text).toContain(
            "You will not be able to view or change limited partnership information (except for the SIC codes) as part of this filing."
        );
    });

    it("should return acsp / limited partnership before you file page page, for Private Fund subtype", async () => {
        const response = await doGetPageTest(LIMITED_PARTNERSHIP_SUBTYPES.PFLP);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Before you file the confirmation statement");
        expect(response.text).toContain(
            "You will not be able to view or change limited partnership information as part of this filing."
        );
    });

    it("should return acsp / limited partnership before you file page page, for Scottish Scottish Private Fund subtype", async () => {
        const response = await doGetPageTest(LIMITED_PARTNERSHIP_SUBTYPES.SPFLP);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Before you file the confirmation statement");
        expect(response.text).toContain(
            "You will not be able to view or change limited partnership information as part of this filing."
        );
    });

    it("should forward to Confirmation Statement Date page", async () => {
        const response = await request(app).post(URL).set("Content-Type", "application/json").send({
            byfCheckbox: "confirm",
            limitedPartnershipSubtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
        });

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(302); // Expecting a redirect response
        expect(response.headers.location).toBe(
            "/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/confirmation-statement-date?lang=en"
        );
    });

    it("should reload page with error when checkbox is not selected", async () => {
        (isPaymentDue as jest.Mock).mockReturnValue(true);
        (getCompanyProfileFromSession as jest.Mock).mockImplementation(_req => {
            return {
                companyNumber: COMPANY_NUMBER,
                type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
                subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
                companyName: "Test Company",
            };
        });

        (getTransaction as jest.Mock).mockResolvedValue({
            id: TRANSACTION_ID,
        });

        const response = await request(app).post(URL).set("Content-Type", "application/json").send({
            limitedPartnershipSubtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
        });

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.text).toContain("Before you file the confirmation statement");
        expect(response.text).toContain("Error: Before you file the confirmation statement");
        expect(response.text).toContain(
            "Confirm that you&#39;ve checked the limited partnership information and submitted any updates"
        );
        expect(response.text).toContain(`${urls.CONFIRM_COMPANY_PATH}?companyNumber=${COMPANY_NUMBER}`);
        expect(response.text).toContain("<strong>&pound;50</strong>");
    });

    it("should have correct previous page setting for gci_return_url ", async () => {
        setGCIReturnUrlInSession();
        const response = await doGetPageTest(LIMITED_PARTNERSHIP_SUBTYPES.LP);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Before you file the confirmation statement");
        expect(response.text).toContain(
            "You will not be able to view or change limited partnership information (except for the SIC codes) as part of this filing."
        );

        // Check the Back link is the correct GCI Return URL value
        const regex = new RegExp('<a href="' + GCI_RETURN_URL + '" class="govuk-back-link');
        expect(response.text).toMatch(regex);
    });
});

function doGetPageTest(subtype: string) {
    (getCompanyProfileFromSession as jest.Mock).mockImplementation(_req => {
        return {
            companyNumber: COMPANY_NUMBER,
            type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
            subtype: subtype,
            companyName: "Test Company",
        };
    });

    (getTransaction as jest.Mock).mockResolvedValue({
        id: TRANSACTION_ID,
    });
    return request(app).get(URL);
}

function setGCIReturnUrlInSession() {
    middlewareMocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
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
                gci_return_url: GCI_RETURN_URL,
            },
        };

        req.session = session;
        return next();
    });
}
