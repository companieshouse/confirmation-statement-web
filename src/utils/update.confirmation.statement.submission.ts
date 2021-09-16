import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import {
  ConfirmationStatementSubmission,
  RegisteredOfficeAddressData,
  ActiveDirectorDetailsData,
  SectionStatus,
  PersonsOfSignificantControlData,
  SicCodeData,
  StatementOfCapitalData,
  ShareholderData,
  RegisterLocationsData,
  TradingStatusData
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement, updateConfirmationStatement } from "../services/confirmation.statement.service";
import { SECTIONS } from "../utils/constants";
import { urlUtils } from "../utils/url";

export const sendUpdate = async (req: Request, sectionName: SECTIONS, status: SectionStatus, extraData?: any ) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session = req.session as Session;
  const currentCsSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
  const sectionData = generateSectionData(sectionName, status, extraData);
  const csSubmission = updateCsSubmission(currentCsSubmission, sectionName, sectionData);
  await updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
};

export const sendTradingStatusUpdate = async (req: Request, tradingStatus: boolean) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session = req.session as Session;
  const tradingStatusData: TradingStatusData = {
    tradingStatusAnswer: tradingStatus
  };
  const csSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
  csSubmission.data.tradingStatusData = tradingStatusData;
  await updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
};

const updateCsSubmission = (currentCsSubmission: ConfirmationStatementSubmission, sectionName: SECTIONS, sectionData: any ): ConfirmationStatementSubmission => {
  currentCsSubmission.data[sectionName] = sectionData;
  return currentCsSubmission;
};

const generateSectionData = (section: SECTIONS, status: SectionStatus, extraData?: any): any => {
  switch (section) {
      case SECTIONS.ACTIVE_DIRECTOR: {
        const newData: ActiveDirectorDetailsData = {
          sectionStatus: status,
        };
        return newData;
      }
      case SECTIONS.PSC: {
        const newPSCData: PersonsOfSignificantControlData = {
          sectionStatus: status
        };
        return newPSCData;
      }
      case SECTIONS.ROA: {
        const newRoaData: RegisteredOfficeAddressData = {
          sectionStatus: status,
        };
        return newRoaData;
      }
      case SECTIONS.SIC: {
        const newSicData: SicCodeData = {
          sectionStatus: status
        };
        return newSicData;
      }
      case SECTIONS.SOC: {
        const newSocData: StatementOfCapitalData = {
          sectionStatus: status
        };
        if (extraData) {
          newSocData.statementOfCapital = extraData;
        }
        return newSocData;
      }
      case SECTIONS.SHAREHOLDER: {
        const newShareholderData: ShareholderData = {
          sectionStatus: status
        };
        return newShareholderData;
      }
      case SECTIONS.REGISTER_LOCATIONS: {
        const newRegisterLocationsData: RegisterLocationsData = {
          sectionStatus: status
        };
        return newRegisterLocationsData;
      }
  }
};
