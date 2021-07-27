import { ConfirmationStatementSubmission, StatementOfCapitalData } from "private-api-sdk-node/dist/services/confirmation-statement";

const getBaseCSSubmission = (transactionId: string, csSubmissionId: string): ConfirmationStatementSubmission => {
  return {
    id: csSubmissionId,
    links: {
      self: `/transactions/${transactionId}/confirmation-statement/${csSubmissionId}`
    }
  };
};

export class ConfirmationStatementSubmissionBuilder {

  private isBuildWithData: boolean = false;
  private readonly transactionId: string;
  private readonly csSubmissionId: string;
  private statementOfCapitalData: StatementOfCapitalData;

  constructor(transctionId: string, csSubmissionId: string) {
    this.transactionId = transctionId;
    this.csSubmissionId = csSubmissionId;
  }

  withStatementOfCapitalData = (statementOfCapitalData: StatementOfCapitalData) => {
    this.statementOfCapitalData = statementOfCapitalData;
    this.isBuildWithData = true;
    return this;
  };

  build = () => {
    const csSubmission: ConfirmationStatementSubmission = getBaseCSSubmission(this.transactionId, this.csSubmissionId);
    if (this.isBuildWithData) {
      csSubmission.data = {};
      csSubmission.data.statementOfCapitalData = this.statementOfCapitalData;
    }
    return csSubmission;
  };
}
