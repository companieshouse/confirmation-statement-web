import { ConfirmationStatementSubmission, SectionStatus, StatementOfCapital } from "private-api-sdk-node/dist/services/confirmation-statement";
import { ConfirmationStatementSubmissionBuilder } from "../../../src/types/builders/confirmation.statement.submission.builder";

const TRANSACTION_ID = "735564";
const CS_SUBMISSION_ID = "245435";

describe("Confirmation Statement Submission Builder tests", () => {

  it("Should build a basic ConfirmationStatementSubmission with no optionals ", () => {
    const csSubmission: ConfirmationStatementSubmission = new ConfirmationStatementSubmissionBuilder(TRANSACTION_ID, CS_SUBMISSION_ID)
      .build();

    expect(csSubmission.id).toBe(CS_SUBMISSION_ID);
    expect(csSubmission.links.self).toBe(`/transactions/${TRANSACTION_ID}/confirmation-statement/${CS_SUBMISSION_ID}`);
  });

  it("Should build a ConfirmationStatementSubmission with StatementOfCapitalData ", () => {
    const statementOfCapital: StatementOfCapital = {
      aggregateNominalValue: "1",
      classOfShares: "2",
      currency: "3",
      numberAllotted: "4",
      prescribedParticulars: "5",
      totalAggregateNominalValue: "6",
      totalAmountUnpaidForCurrency: "7",
      totalNumberOfShares: "8"
    };

    const csSubmission: ConfirmationStatementSubmission = new ConfirmationStatementSubmissionBuilder(TRANSACTION_ID, CS_SUBMISSION_ID)
      .withStatementOfCapitalData({
        sectionStatus: SectionStatus.CONFIRMED,
        statementOfCapital
      })
      .build();

    expect(csSubmission.id).toBe(CS_SUBMISSION_ID);
    expect(csSubmission.links.self).toBe(`/transactions/${TRANSACTION_ID}/confirmation-statement/${CS_SUBMISSION_ID}`);
    expect(csSubmission.data?.statementOfCapitalData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    expect(csSubmission.data?.statementOfCapitalData?.statementOfCapital).toBe(statementOfCapital);
  });
});
