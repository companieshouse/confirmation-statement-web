import { Session } from "@companieshouse/node-session-handler";
import { ACSP_SESSION_KEY } from "../utils/constants";


interface AcspSessionData {
  beforeYouFileCheck: boolean;
  changeConfirmationStatementDate: boolean;
  newConfirmationDate: Date | null;
  confirmAllInformationCheck: boolean;
  confirmLawfulActionsCheck: boolean;
}

export function createDefaultAcspSessionData(): AcspSessionData {
  return {
    beforeYouFileCheck: false,
    changeConfirmationStatementDate: false,
    newConfirmationDate: null,
    confirmAllInformationCheck: false,
    confirmLawfulActionsCheck: false
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
