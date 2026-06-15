import mocks from "../mocks/all.middleware.mock";
import { DIRS_NOT_VERIFIED_PATH } from "../../src/types/page.urls";
import request from "supertest";
import app from "../../src/app";

const DIRS_NOT_VERIFIED_PAGE_TITLE = "You need to use WebFiling service to file this confirmation statement";

describe("Directors not verified controller tests", () => {
    beforeEach(() => {
        mocks.mockAuthenticationMiddleware.mockClear();
        mocks.mockServiceAvailabilityMiddleware.mockClear();
        mocks.mockSessionMiddleware.mockClear();
    });

    describe("test for the get function", () => {
        it("Should render the directors not verified page", async () => {
            const response = await request(app).get(DIRS_NOT_VERIFIED_PATH);

            expect(response.status).toEqual(200);
            expect(response.text).toContain(DIRS_NOT_VERIFIED_PAGE_TITLE);
            expect(response.text).toContain(
                "To do this, you need to file your confirmation statement using our WebFiling service."
            );
        });
    });
});
