import { createOAuthApiClient } from "../../../src/services/api/api.service";
import { getEmptySessionRequest, getSessionRequest } from "../../mocks/session.mock";
import { Session } from "@companieshouse/node-session-handler";

const ERROR_MESSSAGE = "Error getting session keys for creating api client";

describe ("Test node session handler authorization for private sdk", () => {
  it ("should obtain private node sdk oauth client", () => {
    const client = createOAuthApiClient(
      getSessionRequest({ access_token: "token" }));
    expect(client.confirmationStatementService).not.toBeNull();
  });

  it("should throw error when no data is present", () => {
    try {
      createOAuthApiClient({} as Session);
      fail();
    } catch (error) {
      expect(error.message).toBe(ERROR_MESSSAGE);
    }
  });

  it("should throw error when no sign in info is present", () => {
    try {
      const session: Session = getEmptySessionRequest();
      session.data = {};
      createOAuthApiClient(session);
      fail();
    } catch (error) {
      expect(error.message).toBe(ERROR_MESSSAGE);
    }
  });

  it("should throw error when no access token is present", () => {
    try {
      createOAuthApiClient(getSessionRequest());
      fail();
    } catch (error) {
      expect(error.message).toBe(ERROR_MESSSAGE);
    }
  });
});
