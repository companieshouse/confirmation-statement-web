import request from "supertest";
import app from "../../src/app";
import middlewareMocks from "../mocks/all.middleware.mock";
import { LP_MUST_BE_AUTHORISED_AGENT_PATH, CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";

describe("must be authorised agent controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render the must be authorised agent page with correct content", async () => {
        const response = await request(app).get(`${LP_MUST_BE_AUTHORISED_AGENT_PATH}?lang=en`);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.text).toContain("You need to be added to an authorised agent account to view this page");
    });

    it("should back-link to confirm company with companyNumber query when provided", async () => {
        const COMPANY_NUMBER = "12345678";
        const response = await request(app).get(
            `${LP_MUST_BE_AUTHORISED_AGENT_PATH}?lang=en&companyNumber=${COMPANY_NUMBER}`
        );

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);

        const regex = new RegExp(
            '<a href="' + CONFIRM_COMPANY_PATH + "\\?companyNumber=" + COMPANY_NUMBER + '" class="govuk-back-link'
        );
        expect(response.text).toMatch(regex);
    });

    it("should back-link to confirm company without companyNumber when not provided", async () => {
        const response = await request(app).get(`${LP_MUST_BE_AUTHORISED_AGENT_PATH}?lang=en`);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.status).toBe(200);

        const regex = new RegExp('<a href="' + CONFIRM_COMPANY_PATH + '" class="govuk-back-link');
        expect(response.text).toMatch(regex);
    });
});
