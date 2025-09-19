import { Session } from "@companieshouse/node-session-handler";
import { ACSP_SESSION_KEY } from "../utils/constants";
import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";

export interface AcspSessionData {
  beforeYouFileCheck: boolean;
  changeConfirmationStatementDate: boolean | null;
  newConfirmationDate: Date | null;
  confirmAllInformationCheck: boolean;
  confirmLawfulActionsCheck: boolean;
  companySubtype?: string;
  sicCodes: CondensedSicCodeData[];
}

export function createDefaultAcspSessionData(): AcspSessionData {
  return {
    beforeYouFileCheck: false,
    changeConfirmationStatementDate: null,
    newConfirmationDate: null,
    confirmAllInformationCheck: false,
    confirmLawfulActionsCheck: false,
    companySubtype: undefined,
    sicCodes: []
  };
}

export function getAcspSessionData(session: Session): AcspSessionData | undefined {
  return session.getExtraData(ACSP_SESSION_KEY) as AcspSessionData | undefined;
}

export function resetAcspSession(session: Session): void {
  session.setExtraData(ACSP_SESSION_KEY, createDefaultAcspSessionData());
}

export function updateAcspSessionData(session: Session, updates: Partial<AcspSessionData>): void {
  const currentSessionData = getAcspSessionData(session) || createDefaultAcspSessionData();
  const updatedSessionData = { ...currentSessionData, ...updates };
  session.setExtraData(ACSP_SESSION_KEY, updatedSessionData);
}
