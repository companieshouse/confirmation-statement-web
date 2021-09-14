import { ConfirmationStatementSubmission, ConfirmationStatementSubmissionData, SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getTaskCompletedCount } from "../../../src/utils/task/task.counter";
import { mockConfirmationStatementSubmission, mockStatementOfCapital } from "../../mocks/confirmation.statement.submission.mock";

const MADE_UP_TO_DATE = "2021-03-11";

describe("Task Counter tests", () => {

  describe("getTaskCompletedCount tests", () => {
    it("Should return 0 if ConfirmationStatementSubmission.data is undefined", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = undefined as unknown as ConfirmationStatementSubmissionData;
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(0);
    });

    it("Should return 0 if ConfirmationStatementSubmission.data is null", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = null as unknown as ConfirmationStatementSubmissionData;
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(0);
    });

    it("Should return 0 if ConfirmationStatementSubmission.data has no task sections", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = {
        confirmationStatementMadeUpToDate: MADE_UP_TO_DATE
      };
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(0);
    });

    it("Should not try to count undefined sectionStatus", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = {
        confirmationStatementMadeUpToDate: MADE_UP_TO_DATE,
        statementOfCapitalData: {
          sectionStatus: undefined as unknown as SectionStatus,
          statementOfCapital: mockStatementOfCapital
        }
      };
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(0);
    });

    it("Should not try to count null sectionStatus", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = {
        confirmationStatementMadeUpToDate: MADE_UP_TO_DATE,
        statementOfCapitalData: {
          sectionStatus: null as unknown as SectionStatus,
          statementOfCapital: mockStatementOfCapital
        }
      };
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(0);
    });

    it("Should correctly count SectionStatus.CONFIRMED number of checked tasks", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = {
        confirmationStatementMadeUpToDate: MADE_UP_TO_DATE,
        statementOfCapitalData: {
          sectionStatus: SectionStatus.CONFIRMED,
          statementOfCapital: mockStatementOfCapital
        }
      };
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(1);
    });

    it("Should not count SectionStatus.NOT_CONFIRMED tasks", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = {
        confirmationStatementMadeUpToDate: MADE_UP_TO_DATE,
        statementOfCapitalData: {
          sectionStatus: SectionStatus.NOT_CONFIRMED,
          statementOfCapital: mockStatementOfCapital
        }
      };
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(0);
    });

    it("Should correctly count SectionStatus.RECENT_FILING tasks", () => {
      const csSubmission: ConfirmationStatementSubmission = clone(mockConfirmationStatementSubmission);
      csSubmission.data = {
        confirmationStatementMadeUpToDate: MADE_UP_TO_DATE,
        statementOfCapitalData: {
          sectionStatus: SectionStatus.RECENT_FILING,
          statementOfCapital: mockStatementOfCapital
        }
      };
      const count = getTaskCompletedCount(csSubmission);

      expect(count).toBe(1);
    });
  });
});

const clone = (obj: any): any => JSON.parse(JSON.stringify(obj));
