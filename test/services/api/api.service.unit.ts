import { createOAuthApiClient } from "../../../src/services/api/api.service";
import { getSessionRequest } from "../../mocks/session.mock";

describe ("", () => {
  it ("should obtain private node sdk client", () => {
    const client = createOAuthApiClient(getSessionRequest());
    expect(client.confirmationStatementService).not.toBeNull();
  });
});
