import { CompanyOfficers } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

export const validDummyCompanyOfficers: CompanyOfficers = {
  resignedCount: "1",
  inactiveCount: "0",
  links: {
    self: ""
  },
  items: [
    {
      links: {
        officer: {
          appointments: "",
        }
      },
      address: {
        addressLine1: "Flat D 379 Clapham Road",
        addressLine2: "",
        country: "UK",
        postalCode: "SW9 9BT",
        locality: "London"
      },
      nationality: "British",
      name: "Crocodile DICTIONRIVULET",
      officerRole: "director",
      resignedOn: "2009-12-04",
      occupation: "Personal Assistant",
      appointedOn: "2006-04-03",
    }
  ],
  activeCount: "0",
  totalResults: "1",
  etag: "66911f2efbdc0df65480a4e5443940db0ad9e7c3",
  itemsPerPage: "1",
  startIndex: "1",
  kind: "",
};
