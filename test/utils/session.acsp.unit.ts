import { Session } from "@companieshouse/node-session-handler";
import { getAcspSessionData, resetAcspSession, defaultAcspSessionData } from "../../src/utils/session.acsp";
import { ACSP_SESSION_KEY } from "../../src/utils/constants";

const mockSession = {
  getExtraData: jest.fn(),
  setExtraData: jest.fn()
} as unknown as Session;

describe("ACSP Session Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAcspSessionData", () => {
    it("should return ACSP session data when present", () => {
      mockSession.getExtraData = jest.fn().mockReturnValue(defaultAcspSessionData);

      const result = getAcspSessionData(mockSession);
      expect(result).toEqual(defaultAcspSessionData);
      expect(mockSession.getExtraData).toHaveBeenCalledWith(ACSP_SESSION_KEY);
    });

    it("should return undefined when no session data is present", () => {
      mockSession.getExtraData = jest.fn().mockReturnValue(undefined);

      const result = getAcspSessionData(mockSession);
      expect(result).toBeUndefined();
      expect(mockSession.getExtraData).toHaveBeenCalledWith(ACSP_SESSION_KEY);
    });
  });

  describe("resetAcspSession", () => {
    it("should set ACSP session data to default", () => {
      resetAcspSession(mockSession);
      expect(mockSession.setExtraData).toHaveBeenCalledWith(ACSP_SESSION_KEY, defaultAcspSessionData);
    });
  });
});
