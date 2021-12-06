import { formatAddressForDisplay, formatTitleCase } from "../../src/utils/format";
import { Address } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";


describe("formatTitleCase tests", () => {
  it("should return title case", () => {
    const formatted: string = formatTitleCase("example");
    const formattedCaps: string = formatTitleCase("CAPS");
    const formattedMulti: string = formatTitleCase("format multiple words");
    expect(formatted).toEqual("Example");
    expect(formattedCaps).toEqual("Caps");
    expect(formattedMulti).toEqual("Format Multiple Words");
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

// TODO - redo formatting for the chs sdk companyOfficer[]
// describe("formatSecretaryList tests", () => {
//   it("should return formated secretary list", () => {
//     const formattedOfficer = formatSecretaryList(mockActiveOfficersDetails);
//     const expectedOfficer = {
//       forename: "West",
//       surname: "HAM",
//       dateOfAppointment: "1 January 2009",
//       serviceAddress: "Diddly Squat Farm Shop, Chadlington, Thisshire, England, OX7 3PE"
//     };

//     expect(formattedOfficer[0]).toEqual(expectedOfficer);
//   });
// });

