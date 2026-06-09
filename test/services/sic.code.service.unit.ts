import { createInternalApiKeyClient } from "../../src/services/api.service";
import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";
import { getSicCodeCondensedList } from "../../src/services/sic.code.service";

jest.mock("../../src/services/api.service");

describe("getSicCodeCondensedList", () => {
  const mockSicCodes: CondensedSicCodeData[] = [
    { sic_code: "12345", sic_description: "SIC CODE Description 12345" },
    { sic_code: "88888", sic_description: "SIC CODE Description 88888" },
    { sic_code: "01234", sic_description: "SIC CODE Description 01234" },
    { sic_code: "67890", sic_description: "SIC CODE Description 67890" }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of condensed SIC codes when API responds with data", async () => {
    const mockGetCondensedSicCodes = jest.fn().mockResolvedValue({ httpStatusCode: 200, resource: mockSicCodes.slice() });

    (createInternalApiKeyClient as jest.Mock).mockReturnValue({
      sicCodeService: {
        getCondensedSicCodes: mockGetCondensedSicCodes
      }
    });

    const result = await getSicCodeCondensedList();

    expect(result).not.toEqual(mockSicCodes);
    expect(result.length).toEqual(4);
    expect(result[0]).toEqual(mockSicCodes[2]);
    expect(result[1]).toEqual(mockSicCodes[0]);
    expect(result[2]).toEqual(mockSicCodes[3]);
    expect(result[3]).toEqual(mockSicCodes[1]);
    expect(mockGetCondensedSicCodes).toHaveBeenCalledTimes(1);
  });

  it("should return an empty array when API returns no resource", async () => {
    const mockGetCondensedSicCodes = jest.fn().mockResolvedValue({ httpStatusRequest: 500, resource: undefined });

    (createInternalApiKeyClient as jest.Mock).mockReturnValue({
      sicCodeService: {
        getCondensedSicCodes: mockGetCondensedSicCodes
      }
    });

    const result = await getSicCodeCondensedList();

    expect(result).toEqual([]);
    expect(mockGetCondensedSicCodes).toHaveBeenCalledTimes(1);
  });

});
