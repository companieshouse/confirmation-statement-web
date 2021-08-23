jest.mock("../../src/services/confirmation.statement.service");

import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { ConfirmationStatementSubmission, SectionStatus, StatementOfCapitalData } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement, updateConfirmationStatement } from "../../src/services/confirmation.statement.service";
import { sendUpdate } from "../../src/utils/update.confirmation.statement.submission";
import { SECTIONS } from "../../src/utils/constants";
import { ParamsDictionary } from "express-serve-static-core";

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
const mockUpdateConfirmationStatement = updateConfirmationStatement as jest.Mock;

const SUBMISSION_ID = "a80f09e2";
const LINK_SELF = "/something";
const submissionWithNoData: ConfirmationStatementSubmission = {
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
    mockGetConfirmationStatement.mockResolvedValueOnce(submissionWithNoData);
  });

  it("Should create csSubmission.data if current csSubmission has no data", async () => {
    await sendUpdate(request, SECTIONS.ACTIVE_DIRECTOR, SectionStatus.CONFIRMED);
    const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
    expect(csSubmission.id).toBe(SUBMISSION_ID);
    expect(csSubmission.links.self).toBe(LINK_SELF);
    expect(csSubmission.data?.activeDirectorDetailsData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
  });

  describe("Should create the correct submission data for each section", () => {

    it("Should create activeDirectorDetails submission data", async () => {
      await sendUpdate(request, SECTIONS.ACTIVE_DIRECTOR, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data?.activeDirectorDetailsData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should update a sections submission data sectionStatus to CONFIRMED when status has already been set to NOT_CONFIRMED", async () => {
      const submissionWithActiveDirectorDetailsData: ConfirmationStatementSubmission = {
        id: SUBMISSION_ID,
        links: {
          self: LINK_SELF
        },
        data: {
          activeDirectorDetailsData: {
            sectionStatus: SectionStatus.NOT_CONFIRMED
          }
        }
      };
      mockGetConfirmationStatement.mockResolvedValueOnce(submissionWithActiveDirectorDetailsData);
      await sendUpdate(request, SECTIONS.ACTIVE_DIRECTOR, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data?.activeDirectorDetailsData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create registeredOfficeAddress submission data", async () => {
      await sendUpdate(request, SECTIONS.ROA, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data?.registeredOfficeAddressData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create personsSignificantControl submission data", async () => {
      await sendUpdate(request, SECTIONS.PSC, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data?.personsSignificantControlData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create sicCode submission data", async () => {
      await sendUpdate(request, SECTIONS.SIC, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data?.sicCodeData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
    });

    it("Should create socCode submission data without statementOfCapital", async () => {
      await sendUpdate(request, SECTIONS.SOC, SectionStatus.CONFIRMED);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data?.statementOfCapitalData?.sectionStatus).toBe(SectionStatus.CONFIRMED);
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
      mockGetConfirmationStatement.mockResolvedValueOnce(submissionWithNoData);
      await sendUpdate(request, SECTIONS.SOC, SectionStatus.CONFIRMED, statementOfCapitalData.statementOfCapital);
      const csSubmission: ConfirmationStatementSubmission = mockUpdateConfirmationStatement.mock.calls[0][3];
      expect(csSubmission.data?.statementOfCapitalData).toStrictEqual(statementOfCapitalData);
    });
  });
});
