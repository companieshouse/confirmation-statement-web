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

export const mockAddress3: Address = {
  addressLine1: "10 Secretary Road",
  addressLine2: undefined,
  careOf: undefined,
  country: "Secretland",
  locality: "Secrettown",
  poBox: undefined,
  postalCode: "SE1 7SE",
  premises: undefined,
  region: "Secretshire"
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

export const mockActiveOfficersDetails: ActiveOfficerDetails[] = [
  {
    foreName1: "JOHN",
    foreName2: "MiddleName",
    surname: "DOE",
    occupation: "singer",
    nationality: "British",
    dateOfBirth: "1 January 1965",
    dateOfAppointment: "1 January 2012",
    serviceAddress: mockAddress1,
    residentialAddress: mockAddress2,
    isCorporate: false,
    role: "Director",
    placeRegistered: undefined,
    registrationNumber: undefined,
    lawGoverned: undefined,
    legalForm: undefined,
    identificationType: undefined,
    countryOfResidence: "UNITED KINGDOM"
  },
  {
    foreName1: "WEST",
    foreName2: "MiddleName",
    surname: "HAM",
    occupation: "singer",
    nationality: "British",
    dateOfBirth: "1 January 1960",
    dateOfAppointment: "1 January 2009",
    serviceAddress: mockAddress3,
    residentialAddress: mockAddress2,
    isCorporate: false,
    role: "Secretary",
    placeRegistered: undefined,
    registrationNumber: undefined,
    lawGoverned: undefined,
    legalForm: undefined,
    identificationType: undefined,
    countryOfResidence: "UNITED KINGDOM"
  },
  {
    foreName1: "MICHEAL",
    foreName2: "MiddleName",
    surname: "MYERS",
    occupation: "singer",
    nationality: "British",
    dateOfBirth: "1 January 1960",
    dateOfAppointment: "1 January 2009",
    serviceAddress: mockAddress1,
    residentialAddress: mockAddress2,
    isCorporate: true,
    role: "Secretary",
    placeRegistered: undefined,
    registrationNumber: "11223344",
    lawGoverned: "Specific Law",
    legalForm: undefined,
    identificationType: undefined,
    countryOfResidence: "UNITED KINGDOM"
  },
  {
    foreName1: "BOND",
    foreName2: "MiddleName",
    surname: "JAMES",
    occupation: "singer",
    nationality: "British",
    dateOfBirth: "1 January 1960",
    dateOfAppointment: "1 January 2009",
    serviceAddress: mockAddress1,
    residentialAddress: mockAddress2,
    isCorporate: true,
    role: "Director",
    placeRegistered: undefined,
    registrationNumber: undefined,
    lawGoverned: undefined,
    legalForm: undefined,
    identificationType: undefined,
    countryOfResidence: "UNITED KINGDOM"
  },
];

export const mockSecureActiveOfficersDetails: ActiveOfficerDetails = {
  foreName1: "JOHN",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  dateOfAppointment: "1 January 2009",
  serviceAddress: mockAddress1,
  residentialAddress: mockSecureAddress,
  isCorporate: false,
  role: "Director",
  placeRegistered: undefined,
  registrationNumber: undefined,
  lawGoverned: undefined,
  legalForm: undefined,
  identificationType: undefined,
  countryOfResidence: "UNITED KINGDOM"
};

export const mockActiveOfficersDetailsFormatted: ActiveOfficerDetails = {
  foreName1: "John",
  foreName2: "Middlename",
  surname: "DOE",
  occupation: "Singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  dateOfAppointment: "1 January 2009",
  serviceAddress: mockAddress1Formatted,
  residentialAddress: mockAddress2Formatted,
  isCorporate: false,
  role: "Director",
  placeRegistered: undefined,
  registrationNumber: undefined,
  lawGoverned: undefined,
  legalForm: undefined,
  identificationType: undefined,
  countryOfResidence: "UNITED KINGDOM"
};


export const mockSecureActiveOfficersDetailsFormatted: ActiveOfficerDetails = {
  foreName1: "John",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  dateOfAppointment: "1 January 2009",
  serviceAddress: mockAddress1Formatted,
  residentialAddress: mockSecureAddress,
  isCorporate: false,
  role: "Director",
  placeRegistered: undefined,
  registrationNumber: undefined,
  lawGoverned: undefined,
  legalForm: undefined,
  identificationType: undefined,
  countryOfResidence: "UNITED KINGDOM"
};
