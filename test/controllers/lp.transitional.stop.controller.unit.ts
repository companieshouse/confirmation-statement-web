jest.mock("../../src/utils/session");

import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfileFromSession } from "../../src/utils/session";
import { validLimitedPartnershipProfile } from "../mocks/company.profile.mock";
import { LP_TRANSITIONAL_STOP_PATH } from "../../src/types/page.urls";
import { FEATURE_FLAG_LP_REFORM_DATE } from "../../src/utils/properties";
import { addDayToDateString } from "../../src/utils/date";
import { DMMMMYYYY_DATE_FORMAT } from "../../src/utils/constants";

const mockGetCompanyProfileFromSession = getCompanyProfileFromSession as jest.Mock;

const PAGE_TITLE = "Transitional Return required - Limited Partnership";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with the service";

describe("LP transitional stop controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCompanyProfileFromSession.mockReturnValue(validLimitedPartnershipProfile);
    });

    it("Should render the LP transitional stop page", async () => {
        const response = await request(app).get(LP_TRANSITIONAL_STOP_PATH);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain(PAGE_TITLE);
        const expectedDate = addDayToDateString(DMMMMYYYY_DATE_FORMAT, FEATURE_FLAG_LP_REFORM_DATE, 1);
        expect(response.text).toContain(expectedDate);
    });

    it("Should return error page if no company in session", async () => {
        mockGetCompanyProfileFromSession.mockReturnValueOnce(undefined);
        const response = await request(app).get(LP_TRANSITIONAL_STOP_PATH);

        expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });
});
