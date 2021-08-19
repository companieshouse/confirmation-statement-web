import { ActiveDirectorDetails } from "private-api-sdk-node/dist/services/confirmation-statement";

export const mockAddress1 = {
  address_line_1: "Diddly squat farm shop",
  address_line_2: null,
  care_of: null,
  country: "England",
  locality: "Chadlington",
  po_box: null,
  postal_code: "OX7 3PE",
  premises: null,
  region: "Thisshire"
};

export const mockAddress1Formatted = {
  address_line_1: "Diddly Squat Farm Shop",
  address_line_2: null,
  care_of: null,
  country: "England",
  locality: "Chadlington",
  po_box: null,
  postal_code: "OX7 3PE",
  premises: null,
  region: "Thisshire"
};

export const mockAddress2 = {
  address_line_1: "10 This road",
  address_line_2: "This",
  care_of: "abc",
  country: "Thisland",
  locality: "Thistown",
  po_box: "1",
  postal_code: "TH1 1AB",
  premises: "10",
  region: "Thisshire"
};

export const mockSecureAddress = {
  address_line_1: "10 This road",
  address_line_2: null,
  care_of: null,
  country: null,
  locality: null,
  po_box: null,
  postal_code: null,
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
  foreName2: "Middlename",
  surname: "DOE",
  occupation: "Singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  serviceAddress: mockAddress1Formatted,
  residentialAddress: mockSecureAddress
};
