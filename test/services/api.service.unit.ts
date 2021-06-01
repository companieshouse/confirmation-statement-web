jest.mock("../../src/utils/logger");

import { createOAuthApiClient } from "../../src/services/api.service";
import { getEmptySessionRequest, getSessionRequest } from "../mocks/session.mock";
import { Session } from "@companieshouse/node-session-handler";
import { createAndLogError } from "../../src/utils/logger";

const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

const COMPANY_NUMBER = "12345678";
const ERROR_MESSSAGE = "Error getting session keys for creating api client";

describe ("Test node session handler authorization for private sdk", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it ("Should obtain private node sdk oauth client", () => {
    const client = createOAuthApiClient(getSessionRequest(COMPANY_NUMBER, { access_token: "token" }));
    expect(client.confirmationStatementService).not.toBeNull();
  });

  it("Should throw error when no data is present", () => {
    try {
      createOAuthApiClient({} as Session);
      fail();
    } catch (error) {
      expect(mockCreateAndLogError).toBeCalledWith(ERROR_MESSSAGE);
    }
  });

  it("Should throw error when no sign in info is present", () => {
    try {
      const session: Session = getEmptySessionRequest();
      session.data = {};
      createOAuthApiClient(session);
      fail();
    } catch (error) {
      expect(mockCreateAndLogError).toBeCalledWith(ERROR_MESSSAGE);
    }
  });

  it("Should throw error when no access token is present", () => {
    try {
      createOAuthApiClient(getSessionRequest());
      fail();
    } catch (error) {
      expect(mockCreateAndLogError).toBeCalledWith(ERROR_MESSSAGE);
    }
  });
});
