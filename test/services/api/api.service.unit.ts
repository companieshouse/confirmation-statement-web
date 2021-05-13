import { createOAuthApiClient } from "../../../src/services/api/api.service";
import {getEmptySessionRequest, getSessionRequest} from "../../mocks/session.mock";
import {Session} from "@companieshouse/node-session-handler";

describe ("Test node session handler authorization for private sdk", () => {
  it ("should obtain private node sdk oauth client", () => {
    const client = createOAuthApiClient(
        getSessionRequest({ access_token: "token" }));
    expect(client.confirmationStatementService).not.toBeNull();
  });

  it("should throw error when no data is present", () => {
     expect(createOAuthApiClient(getEmptySessionRequest()))
        .toThrow(new Error("Error getting session keys for creating api client "));
  });

  it("should throw error when no sign in info is present", () => {
    const session: Session = getEmptySessionRequest();
    session.data = {};
    expect(createOAuthApiClient(session))
        .toThrow(new Error("Error getting session keys for creating api client "));
  });

  it("should throw error when no access token is present", () => {
    expect(createOAuthApiClient(getSessionRequest()))
        .toThrow(new Error("Error getting session keys for creating api client "));
  });
});
