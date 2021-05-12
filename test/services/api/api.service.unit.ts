import { createOAuthApiClient } from "../../../src/services/api/api.service";
import { getSessionRequest } from "../../mocks/session.mock";

describe ("Test node session handler authorization for private sdk", () => {
  it ("should obtain private node sdk oauth client", () => {
    const client = createOAuthApiClient(getSessionRequest());
    expect(client.confirmationStatementService).not.toBeNull();
  });
});
