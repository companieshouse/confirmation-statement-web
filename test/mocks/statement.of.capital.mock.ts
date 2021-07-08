import { StatementOfCapital } from "private-api-sdk-node/dist/services/confirmation-statement";

export const mockStatementOfCapital: StatementOfCapital = {
  classOfShares: "Ordinary",
  currency: "GBP",
  numberAllotted: 10,
  aggregateNominalValue: 1,
  prescribedParticulars: "This is a test",
  totalCurrency: "GBP",
  totalNumberOfShares: 10,
  totalAggregateNominalValue: 10,
  totalAmountUnpaidForCurrency: 1
};
