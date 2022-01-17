import { formatAddressForDisplay, formatTitleCase } from "../../src/utils/format";
import { Address } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { LEGAL_FORM_FORMAT_EXCLUDE_WORDS } from "../../src/utils/constants";

describe("formatTitleCase tests", () => {
  it("should return title case", () => {
    const formatted: string = formatTitleCase("example");
    const formattedCaps: string = formatTitleCase("CAPS");
    const formattedMulti: string = formatTitleCase("format multiple words");
    expect(formatted).toEqual("Example");
    expect(formattedCaps).toEqual("Caps");
    expect(formattedMulti).toEqual("Format Multiple Words");
  });

  it("should return empty string", () => {
    const empty: string = formatTitleCase("");
    const emptyUndefined: string = formatTitleCase(undefined);
    expect(empty).toEqual("");
    expect(emptyUndefined).toEqual("");
  });

  it("should not format excluded words", () => {
    const result: string = formatTitleCase("THIS LLC should not BE IBC converted LTDA", LEGAL_FORM_FORMAT_EXCLUDE_WORDS);
    expect(result).toEqual("This LLC Should Not Be IBC Converted LTDA");
  });
});

describe("formatAddressForDisplay tests", () => {
  it("should comma separate address values", () => {
    const address: Address = {
      addressLine1: "10 my street",
      locality: "South Glamorgan",
      country: "UK",
      postalCode: "CF1 1AA"
    } as Address;
    const formattedAddress: string = formatAddressForDisplay(address);

    expect(formattedAddress).toBe("10 my street, South Glamorgan, UK, CF1 1AA");
  });
});
