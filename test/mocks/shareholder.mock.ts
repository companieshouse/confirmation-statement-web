import { Shareholder } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const mockShareholder: Shareholder[] = [
  {
    foreName1: "SAUL",
    foreName2: "F",
    surname: "GOODMAN",
    shares: "123",
    classOfShares: "ORDINARY",
    currency: "GBP"
  }
];

export const mockShareholderFormatted: Shareholder[] = [
  {
    foreName1: "Saul",
    foreName2: "F",
    surname: "GOODMAN",
    shares: "123",
    classOfShares: "Ordinary",
    currency: "GBP"
  }
];
