import { ConfirmationStatementSubmission, SectionStatus } from "private-api-sdk-node/dist/services/confirmation-statement";

export const mockConfirmationStatementSubmission: ConfirmationStatementSubmission = {
  id: "dgshjgdsj",
  data: {
    statementOfCapitalData: {
      sectionStatus: SectionStatus.CONFIRMED,
      statementOfCapital: {
        aggregateNominalValue: "12",
        classOfShares: "class",
        currency: "GBP",
        numberAllotted: "123",
        prescribedParticulars: "sssds",
        totalAggregateNominalValue: "321.57",
        totalAmountUnpaidForCurrency: "111",
        totalNumberOfShares: "555"
      }
    }
  },
  links: {
    self: "/somewhere/"
  }
};
