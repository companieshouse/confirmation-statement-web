jest.mock("../../src/utils/logger");

import { createPrivateOAuthApiClient } from "../../src/services/api.service";
import { getEmptySessionRequest, getSessionRequest } from "../mocks/session.mock";
import { Session } from "@companieshouse/node-session-handler";
import { createAndLogError } from "../../src/utils/logger";

const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

const ERROR_MESSSAGE = "Error getting session keys for creating private api client";

describe ("Test node session handler authorization for private sdk", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it ("Should obtain private node sdk oauth client", () => {
    const client = createPrivateOAuthApiClient(getSessionRequest({ access_token: "token" }));
    expect(client.confirmationStatementService).not.toBeNull();
  });

  it("Should throw error when no data is present", () => {
    try {
      createPrivateOAuthApiClient({} as Session);
      fail();
    } catch (error) {
      expect(mockCreateAndLogError).toBeCalledWith(ERROR_MESSSAGE);
    }
  });

  it("Should throw error when no sign in info is present", () => {
    try {
      const session: Session = getEmptySessionRequest();
      session.data = {};
      createPrivateOAuthApiClient(session);
      fail();
    } catch (error) {
      expect(mockCreateAndLogError).toBeCalledWith(ERROR_MESSSAGE);
    }
  });

  it("Should throw error when no access token is present", () => {
    try {
      createPrivateOAuthApiClient(getSessionRequest());
      fail();
    } catch (error) {
      expect(mockCreateAndLogError).toBeCalledWith(ERROR_MESSSAGE);
    }
  });
});
