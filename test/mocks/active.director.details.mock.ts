import { ActiveOfficerDetails, Address } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const mockAddress1: Address = {
  addressLine1: "Diddly squat farm shop",
  addressLine2: undefined,
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

export const mockSecureAddress: Address = {
  addressLine1: "Companies House Cannot Disclose this Home Address",
  addressLine2: undefined,
  careOf: undefined,
  country: undefined,
  locality: undefined,
  poBox: undefined,
  postalCode: undefined,
  premises: undefined,
  region: undefined
};

export const mockActiveOfficerDetails: ActiveOfficerDetails = {
  foreName1: "JOHN",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  dateOfAppointment: "1 January 2009",
  serviceAddress: mockAddress1,
  residentialAddress: mockAddress2
};

export const mockSecureActiveOfficerDetails: ActiveOfficerDetails = {
  foreName1: "JOHN",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  dateOfAppointment: "1 January 2009",
  serviceAddress: mockAddress1,
  residentialAddress: mockSecureAddress
};

export const mockActiveOfficerDetailsFormatted: ActiveOfficerDetails = {
  foreName1: "John",
  foreName2: "Middlename",
  surname: "DOE",
  occupation: "Singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  dateOfAppointment: "1 January 2009",
  serviceAddress: mockAddress1Formatted,
  residentialAddress: mockAddress2Formatted
};


export const mockSecureActiveOfficerDetailsFormatted: ActiveOfficerDetails = {
  foreName1: "John",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  dateOfAppointment: "1 January 2009",
  serviceAddress: mockAddress1Formatted,
  residentialAddress: mockSecureAddress
};
