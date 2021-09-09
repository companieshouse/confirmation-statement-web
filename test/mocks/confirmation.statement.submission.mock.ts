import {
  ConfirmationStatementSubmission, SectionStatus,
  StatementOfCapital
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const mockStatementOfCapital: StatementOfCapital = {
  classOfShares: "Ordinary",
  currency: "GBP",
  numberAllotted: "100",
  aggregateNominalValue: "0.01",
  prescribedParticulars: "THE QUICK BROWN FOX",
  totalNumberOfShares: "100",
  totalAggregateNominalValue: "1",
  totalAmountUnpaidForCurrency: "2"
};


export const mockConfirmationStatementSubmission: ConfirmationStatementSubmission = {
  id: "dgshjgdsj",
  data: {
    statementOfCapitalData: {
      sectionStatus: SectionStatus.CONFIRMED,
      statementOfCapital: mockStatementOfCapital
    }
  },
  links: {
    self: "/somewhere/"
  }
};
