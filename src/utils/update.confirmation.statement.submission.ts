import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import {
  ConfirmationStatementSubmission,
  RegisteredEmailAddressData,
  SectionStatus,
  StatementOfCapitalData,
  TradingStatusData
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement, updateConfirmationStatement } from "../services/confirmation.statement.service";
import { SECTIONS, ACCEPT_LAWFUL_PURPOSE_STATEMENT } from "./constants";
import { urlUtils } from "./url";

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

export const sendLawfulPurposeStatementUpdate = async (req: Request, acceptLawfulPurposeStatment: boolean) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session = req.session as Session;
  const csSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
  csSubmission.data[ACCEPT_LAWFUL_PURPOSE_STATEMENT] = acceptLawfulPurposeStatment;
  await updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
};

const updateCsSubmission = (currentCsSubmission: ConfirmationStatementSubmission, sectionName: SECTIONS, sectionData: any ): ConfirmationStatementSubmission => {
  currentCsSubmission.data[sectionName] = sectionData;
  return currentCsSubmission;
};

const generateSectionData = (section: SECTIONS, status: SectionStatus, extraData?: any): any => {
  switch (section) {
      case SECTIONS.SOC: {
        const newSocData: StatementOfCapitalData = {
          sectionStatus: status
        };
        if (extraData) {
          newSocData.statementOfCapital = extraData;
        }
        return newSocData;
      }

      case SECTIONS.EMAIL: {
        const newEmailData: RegisteredEmailAddressData = {
          sectionStatus: status
        };
        if (extraData) {
          newEmailData.registeredEmailAddress = extraData;
        }
        return newEmailData;
      }

      default: {
        return {
          sectionStatus: status,
        };
      }
  }
};
