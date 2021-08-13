import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import {
  ConfirmationStatementSubmission,
  RegisteredOfficeAddressData,
  ActiveDirectorDetailsData,
  SectionStatus,
  PersonsOfSignificantControlData,
  SicCodeData,
  StatementOfCapitalData
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement, updateConfirmationStatement } from "../services/confirmation.statement.service";
import { SECTIONS } from "../utils/constants";
import { urlUtils } from "../utils/url";

export const sendUpdate = async (req: Request, status: SectionStatus, section: SECTIONS ) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session = req.session as Session;
  const currentCsSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
  const csSubmission = updateCsSubmission(currentCsSubmission, status, section);
  await updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
};

const updateCsSubmission = (currentCsSubmission: ConfirmationStatementSubmission, status: SectionStatus, section: SECTIONS ): ConfirmationStatementSubmission => {
  if (!currentCsSubmission.data) {
    currentCsSubmission.data = {};
  }

  switch (section) {
    case SECTIONS.ACTIVE_DIRECTOR:
      const newData: ActiveDirectorDetailsData = {
        sectionStatus: status,
      };
      currentCsSubmission.data.activeDirectorDetailsData = newData;
      break;
    case SECTIONS.PSC:
      const newPSCData: PersonsOfSignificantControlData = {
        sectionStatus: status
      };
      currentCsSubmission.data.personsSignificantControlData = newPSCData;
      break;
    case SECTIONS.ROA:
      const newRoaData: RegisteredOfficeAddressData = {
        sectionStatus: status,
      };
      currentCsSubmission.data.registeredOfficeAddressData = newRoaData;
      break;
    case SECTIONS.SIC:
      const newSicData: SicCodeData = {
        sectionStatus: status
      };
      currentCsSubmission.data.sicCodeData = newSicData;
      break;
    case SECTIONS.SOC:
      const newSocData: StatementOfCapitalData = {
        sectionStatus: status,
      };    
      currentCsSubmission.data.statementOfCapitalData = newSocData;
      break;
  }

  return currentCsSubmission;
};