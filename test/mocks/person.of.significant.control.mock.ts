import { PersonOfSignificantControl } from "private-api-sdk-node/dist/services/confirmation-statement";
import { CompanyPersonsWithSignificantControlStatements, CompanyPersonWithSignificantControlStatement } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements";

export const mockPersonsOfSignificantControl: PersonOfSignificantControl[] = [
  {
    address: {
      addressLine1: "add line 1",
      addressLine2: "add line 2",
      careOf: "care of",
      country: "country",
      locality: "locality",
      poBox: "po box",
      postalCode: "post code",
      premises: "premises",
      region: "region"
    },
    appointmentType: "5007",
    companyName: "comp name",
    countryOfResidence: "UK",
    dateOfBirth: {
      month: 3,
      year: 1956
    },
    lawGoverned: "law governed",
    legalForm: "legal form",
    nameElements: {
      forename: "Fred",
      middleName: "middle",
      otherForenames: "other",
      surname: "Flintstone",
      title: "Mr"
    },
    nationality: "nationality",
    naturesOfControl: [ "noc1", "noc2" ],
    registrationNumber: "reg no",
    serviceAddressLine_1: "serv line 1",
    serviceAddressPostCode: "serv post code",
    serviceAddressPostTown: "serv town"
  }
];

export const mockCompanyPscStatementResource: CompanyPersonsWithSignificantControlStatements = {
  activeCount: "3",
  ceasedCount: "4",
  items: [
    {
      etag: "ETAG",
      ceasedOn: "2019-11-22",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "2019-10-23",
      statement: "STATEMENT1"
    },
    {
      etag: "ETAG",
      ceasedOn: "2019-12-25",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "2019-05-13",
      statement: "STATEMENT2"
    },
    {
      etag: "ETAG",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "2020-05-13",
      statement: "STATEMENT3"
    },
    {
      etag: "ETAG",
      ceasedOn: "2019-12-25",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "2019-05-13",
      statement: "STATEMENT4"
    },
    {
      etag: "ETAG",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "2017-02-03",
      statement: "STATEMENT5"
    },
    {
      etag: "ETAG",
      ceasedOn: "2019-12-25",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "2019-05-13",
      statement: "STATEMENT6"
    },
    {
      etag: "ETAG",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "2021-07-13",
      statement: "STATEMENT7"
    }
  ],
  links: { self: "SELF" },
  totalResults: "7"
};

export const mockSingleActivePsc: CompanyPersonWithSignificantControlStatement = {
  etag: "etag",
  kind: "kind",
  links: {
    self: "self"
  },
  notifiedOn: "2020-05-03",
  statement: "Active Psc Statement",
  linkedPscName: "Bob"
};
