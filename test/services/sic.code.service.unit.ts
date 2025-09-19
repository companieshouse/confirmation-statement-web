import { createInternalApiKeyClient } from "../../src/services/api.service";
import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";
import { getSicCodeCondensedList } from "../../src/services/sic.code.service";

jest.mock("../../src/services/api.service");

describe("getSicCodeCondensedList", () => {
  const mockSicCodes: CondensedSicCodeData[] = [
    { sic_code: "12345", sic_description: "SIC CODE Description 12345" },
    { sic_code: "67890", sic_description: "SIC CODE Description 67890" }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of condensed SIC codes when API responds with data", async () => {
    const mockGetCondensedSicCodes = jest.fn().mockResolvedValue({ resource: mockSicCodes });

    (createInternalApiKeyClient as jest.Mock).mockReturnValue({
      sicCodeService: {
        getCondensedSicCodes: mockGetCondensedSicCodes
      }
    });

    const result = await getSicCodeCondensedList();

    expect(result).toEqual(mockSicCodes);
    expect(mockGetCondensedSicCodes).toHaveBeenCalledTimes(1);
  });

  it("should return an empty array when API returns no resource", async () => {
    const mockGetCondensedSicCodes = jest.fn().mockResolvedValue({ resource: undefined });

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
