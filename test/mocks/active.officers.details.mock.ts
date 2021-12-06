import { Address, CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers";

export const mockAddress1: Address = {
  addressLine1: "Diddly squat farm shop",
  addressLine2: "Street name",
  careOf: undefined,
  country: "England",
  locality: "Chadlington",
  poBox: undefined,
  postalCode: "OX7 3PE",
  premises: undefined,
  region: "Thisshire"
};

export const mockAddress1Formatted: Address = {
  addressLine1: "Diddly Squat Farm Shop",
  addressLine2: "",
  careOf: "",
  country: "England",
  locality: "Chadlington",
  poBox: "",
  postalCode: "OX7 3PE",
  premises: "",
  region: "Thisshire"
};

export const mockAddress2: Address = {
  addressLine1: "10 this road",
  addressLine2: "this",
  careOf: "abc",
  country: "Thisland",
  locality: "This town",
  poBox: "1",
  postalCode: "TH1 1AB",
  premises: "10",
  region: "Thisshire"
};

export const mockAddress2Formatted: Address = {
  addressLine1: "10 This Road",
  addressLine2: "This",
  careOf: "Abc",
  country: "Thisland",
  locality: "This Town",
  poBox: "1",
  postalCode: "TH1 1AB",
  premises: "10",
  region: "Thisshire"
};

export const mockActiveOfficersDetails: CompanyOfficer[] = [
  {
    address: mockAddress1,
    appointedOn: "1 January 2009",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: { day: "1", month: "1", year: "1960" },
    formerNames: [{ forenames: "Bob", surname: "Johnson" }],
    identification: undefined,
    links: { officer: { appointments: "appointments" } },
    name: "John Doe",
    nationality: "British",
    occupation: "singer",
    officerRole: "director",
    resignedOn: undefined
  },
  {
    address: mockAddress1,
    appointedOn: "1 January 2008",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: { day: "1", month: "1", year: "1955" },
    formerNames: [{ forenames: "Bob", surname: "Johnson" }],
    identification: undefined,
    links: { officer: { appointments: "appointments" } },
    name: "John Poe",
    nationality: "British",
    occupation: "singer",
    officerRole: "secretary",
    resignedOn: undefined
  },
  {
    address: mockAddress1,
    appointedOn: "1 January 2009",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: { day: "1", month: "1", year: "1960" },
    formerNames: [{ forenames: "Bob", surname: "Johnson" }],
    identification: undefined,
    links: { officer: { appointments: "appointments" } },
    name: "Tom Smith",
    nationality: "British",
    occupation: "singer",
    officerRole: "director",
    resignedOn: undefined
  },
  {
    address: mockAddress1,
    appointedOn: "1 January 2009",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: { day: "1", month: "1", year: "1960" },
    formerNames: [{ forenames: "Bob", surname: "Johnson" }],
    identification: undefined,
    links: { officer: { appointments: "appointments" } },
    name: "Jim Cox",
    nationality: "British",
    occupation: "singer",
    officerRole: "director",
    resignedOn: undefined
  },
];

