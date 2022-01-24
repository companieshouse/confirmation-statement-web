import { Address } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { appointmentTypes } from "../../src/utils/constants";

const mockNameElements = {
  forename: "Joe",
  surname: "Bloggs",
  title: "Mr"
};

const mockPscUra: Address = {
  addressLine1: "10 this road",
  addressLine2: undefined,
  careOf: undefined,
  country: "Thisland",
  locality: "This town",
  poBox: undefined,
  postalCode: "TH1 1AB",
  premises: undefined,
  region: "Thisshire"
};

const mockPscServiceAddress: Address = {
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

export const mockPscList: any[] = [
  {
    appointmentType: appointmentTypes.INDIVIDUAL_PSC,
    nameElements: mockNameElements,
    nationality: "British",
    countryOfResidence: "United Kingdom",
    address: mockPscUra,
    serviceAddress: mockPscServiceAddress,
    dateOfBirthIso: "1965-03-21",
    appointmentDate: "1 January 2012",
    naturesOfControl: [
      "75% or more of shares held as a person",
      "Ownership of voting rights - more than 75%"
    ]
  }
];
