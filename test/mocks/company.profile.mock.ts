import { Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const validCompanyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "Test Company",
  companyNumber: "12345678",
  companyStatus: "active",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    nextDue: "2020-04-30",
    overdue: false,
  },
  dateOfCreation: "1972-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "line1",
    addressLineTwo: "line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "post code",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "limited",
};

export const validSDKResource: Resource<CompanyProfile> = {
  httpStatusCode: 200,
  resource: validCompanyProfile,
};
