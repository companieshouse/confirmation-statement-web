import { createInternalApiKeyClient, createPublicOAuthApiClient } from "../../src/services/api.service";
import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";
import { getSicCodeCondensedList } from "../../src/services/sic.code.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ConfirmationStatementService } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

jest.mock("../../src/services/api.service");
const mockGetCondensedSicCodeList = ConfirmationStatementService.prototype.getCondensedSicCodeList as jest.Mock;

describe("getSicCodeCondensedList", () => {
    const mockSicCodes: CondensedSicCodeData[] = [
        { sic_code: "12345", sic_description: "SIC CODE Description 12345" },
        { sic_code: "88888", sic_description: "SIC CODE Description 88888" },
        { sic_code: "01234", sic_description: "SIC CODE Description 01234" },
        { sic_code: "67890", sic_description: "SIC CODE Description 67890" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a list of condensed SIC codes when API responds with data", async () => {
        const mockGetCondensedSicCodes = jest
            .fn()
            .mockResolvedValue({ httpStatusCode: 200, resource: mockSicCodes.slice() });

        (createPublicOAuthApiClient as jest.Mock).mockReturnValue({
            confirmationStatementService: {
                getCondensedSicCodeList: mockGetCondensedSicCodes,
            },
        });

        const result = await getSicCodeCondensedList(getSessionRequest({ access_token: "token" }));

        expect(result).not.toEqual(mockSicCodes);
        expect(result.length).toEqual(4);
        expect(result[0]).toEqual(mockSicCodes[2]);
        expect(result[1]).toEqual(mockSicCodes[0]);
        expect(result[2]).toEqual(mockSicCodes[3]);
        expect(result[3]).toEqual(mockSicCodes[1]);
        expect(mockGetCondensedSicCodes).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array when API returns no resource", async () => {
        const mockGetCondensedSicCodes = jest
            .fn()
            .mockResolvedValue({ httpStatusRequest: 500, resource: "Internal Server Error" });

        (createPublicOAuthApiClient as jest.Mock).mockReturnValue({
            confirmationStatementService: {
                getCondensedSicCodeList: mockGetCondensedSicCodes,
            },
        });

        const result = await getSicCodeCondensedList(getSessionRequest({ access_token: "token" }));

        expect(result).toEqual([]);
        expect(mockGetCondensedSicCodes).toHaveBeenCalledTimes(1);
    });
});
