import { Session } from "@companieshouse/node-session-handler";
import {
  getAcspSessionData,
  resetAcspSession,
  createDefaultAcspSessionData
} from "../../src/utils/session.acsp";
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
      const mockData = createDefaultAcspSessionData();
      mockSession.getExtraData = jest.fn().mockReturnValue(mockData);

      const result = getAcspSessionData(mockSession);
      expect(result).toEqual(mockData);
      expect(mockSession.getExtraData).toHaveBeenCalledWith(ACSP_SESSION_KEY);
    });

    it("should return undefined when no session data is present", () => {
      mockSession.getExtraData = jest.fn().mockReturnValue(undefined);

      const result = getAcspSessionData(mockSession);
      expect(result).toBeUndefined();
      expect(mockSession.getExtraData).toHaveBeenCalledWith(ACSP_SESSION_KEY);
    });

    it("should handle a valid Date in session data", () => {
      const date = new Date("2025-04-24T00:00:00Z");
      const sessionDataWithDate = {
        ...createDefaultAcspSessionData(),
        newConfirmationDate: date
      };

      mockSession.getExtraData = jest.fn().mockReturnValue(sessionDataWithDate);

      const result = getAcspSessionData(mockSession);
      expect(result?.newConfirmationDate?.getTime()).toEqual(date.getTime());
    });
  });

  describe("resetAcspSession", () => {
    it("should set ACSP session data to default", () => {
      const defaultData = createDefaultAcspSessionData();
      resetAcspSession(mockSession);
      expect(mockSession.setExtraData).toHaveBeenCalledWith(ACSP_SESSION_KEY, defaultData);
    });
  });
});
