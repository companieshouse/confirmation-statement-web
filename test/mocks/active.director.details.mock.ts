import { ActiveDirectorDetails } from "private-api-sdk-node/dist/services/confirmation-statement";

export const mockAddress1 = {
  addressLine1: "Diddly squat farm shop",
  addressLine2: null,
  careOf: null,
  country: "England",
  locality: "Chadlington",
  poBox: null,
  postalCode: "OX7 3PE",
  premises: null,
  region: "Thisshire"
};

export const mockAddress1Formatted = {
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

export const mockAddress2 = {
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

export const mockAddress2Formatted = {
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

export const mockSecureAddress = {
  addressLine1: "Companies House Cannot Disclose this Home Address",
  addressLine2: null,
  careOf: null,
  country: null,
  locality: null,
  poBox: null,
  postalCode: null,
  premises: null,
  region: null
};

export const mockActiveDirectorDetails: ActiveDirectorDetails = {
  foreName1: "JOHN",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  serviceAddress: mockAddress1,
  residentialAddress: mockAddress2
};

export const mockSecureActiveDirectorDetails: ActiveDirectorDetails = {
  foreName1: "JOHN",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  serviceAddress: mockAddress1,
  residentialAddress: mockSecureAddress
};

export const mockActiveDirectorDetailsFormatted: ActiveDirectorDetails = {
  foreName1: "John",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "Singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  serviceAddress: mockAddress1Formatted,
  residentialAddress: mockAddress2Formatted
};
