import { PersonOfSignificantControl } from "private-api-sdk-node/dist/services/confirmation-statement";
import { CompanyPersonsWithSignificantControlStatements } from "@companieshouse/api-sdk-node/dist/services/company-psc-statements";

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
    dateOfBirth: {
      month: 3,
      year: 1956
    },
    nameElements: {
      forename: "Fred",
      middleName: "middle",
      otherForenames: "other",
      surname: "Flintstone",
      title: "Mr"
    },
    nationality: "nationality",
    naturesOfControl: [ "noc1", "noc2" ],
    serviceAddressLine_1: "serv line 1",
    serviceAddressPostCode: "serv post code",
    serviceAddressPostTown: "serv town",
    companyName: "comp name"
  }
];

export const mockCompanyPscStatementResource: CompanyPersonsWithSignificantControlStatements = {
  activeCount: "1",
  ceasedCount: "0",
  items: [
    {
      etag: "ETAG",
      kind: "KIND",
      links: { self: "SELF" },
      notifiedOn: "NOTIFIED",
      statement: "STATEMENT"
    }
  ],
  links: { self: "SELF" },
  totalResults: "1"
};
