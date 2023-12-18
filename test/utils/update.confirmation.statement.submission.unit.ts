jest.mock("../../src/services/confirmation.statement.service");

import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { ConfirmationStatementSubmission, SectionStatus, StatementOfCapitalData } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement, updateConfirmationStatement } from "../../src/services/confirmation.statement.service";
import { sendTradingStatusUpdate, sendUpdate, sendLawfulPurposeStatementUpdate } from "../../src/utils/update.confirmation.statement.submission";
import { SECTIONS } from "../../src/utils/constants";
import { ParamsDictionary } from "express-serve-static-core";

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
const mockUpdateConfirmationStatement = updateConfirmationStatement as jest.Mock;

const SUBMISSION_ID = "a80f09e2";
const LINK_SELF = "/something";
const MADE_UP_TO_DATE = "2020-03-11";

const submission: ConfirmationStatementSubmission = {
  data: {
    confirmationStatementMadeUpToDate: MADE_UP_TO_DATE
  },
  id: SUBMISSION_ID,
  links: {
    self: LINK_SELF
  }
};

const request = {
  session: {} as Session,
  params: { companyNumber: "123456", transactionId: "001", sumbmissionId: "001" } as ParamsDictionary
} as Request;

describe("Update.confirmation.statement.submission util tests", () => {

  beforeEach(() => {
    mockUpdateConfirmationStatement.mockClear();
    mockGetConfirmationStatement.mockClear();
    mockGetConfirmationStatement.mockResolvedValueOnce(submission);
  });

  describe("Should create the correct submission data for each section", () => {

    it("Should create activeOfficerDetails submission data", async () => {
      await sendUpdate(request, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.id).toBe(SUBMISSION_ID);
      expect(csSubmission.links.self).toBe(LINK_SELF);
      expect(csSubmission.data.activeOfficerDetailsData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
      expect(csSubmission.data.confirmationStatementMadeUpToDate).toBe(MADE_UP_TO_DATE);
    });

    it("Should update a sections submission data sectionStatus to CONFIRMED when status has already been set to NOT_CONFIRMED", async () => {
      const submissionWithActiveOfficerDetailsData: ConfirmationStatementSubmission = {
        id: SUBMISSION_ID,
        links: {
          self: LINK_SELF
        },
        data: {
          activeOfficerDetailsData: {
            sectionStatus: SectionStatus.NOT_CONFIRMED
          },
          confirmationStatementMadeUpToDate: MADE_UP_TO_DATE
        }
      };
      mockGetConfirmationStatement.mockResolvedValueOnce(submissionWithActiveOfficerDetailsData);
      await sendUpdate(request, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.activeOfficerDetailsData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
      expect(csSubmission.data.confirmationStatementMadeUpToDate).toBe(MADE_UP_TO_DATE);
    });

    it("Should create registeredOfficeAddress submission data", async () => {
      await sendUpdate(request, SECTIONS.ROA, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.registeredOfficeAddressData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create registereLocations submission data", async () => {
      await sendUpdate(request, SECTIONS.REGISTER_LOCATIONS, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.registerLocationsData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create personsSignificantControl submission data", async () => {
      await sendUpdate(request, SECTIONS.PSC, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.personsSignificantControlData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create sicCode submission data", async () => {
      await sendUpdate(request, SECTIONS.SIC, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.sicCodeData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create socCode submission data without statementOfCapital", async () => {
      await sendUpdate(request, SECTIONS.SOC, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.statementOfCapitalData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create statementOfCapital submission data with statementOfCapital", async () => {
      const statementOfCapitalData: StatementOfCapitalData = {
        sectionStatus: SectionStatus.CONFIRMED,
        statementOfCapital: {
          classOfShares: "wqerqt",
          currency: "pounds",
          numberAllotted: "1002",
          aggregateNominalValue: "1",
          prescribedParticulars: "34",
          totalNumberOfShares: "1002",
          totalAggregateNominalValue: "1002",
          totalAmountUnpaidForCurrency: "1002"
        }
      };
      mockGetConfirmationStatement.mockResolvedValueOnce(submission);
      await sendUpdate(request, SECTIONS.SOC, SectionStatus.CONFIRMED, statementOfCapitalData.statementOfCapital);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.statementOfCapitalData).toStrictEqual(statementOfCapitalData);
    });

    it("Should create shareholder submission data", async () => {
      await sendUpdate(request, SECTIONS.SHAREHOLDER, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.shareholderData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create tradingStatus submission data", async () => {
      await sendTradingStatusUpdate(request, true);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.tradingStatusData?.tradingStatusAnswer).toBe(true);
    });

    it("Should create acceptLawfulPurposeStatement submission data", async () => {
      await sendLawfulPurposeStatementUpdate(request, true);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data.acceptLawfulPurposeStatement).toBe(true);
    });
  });
});
