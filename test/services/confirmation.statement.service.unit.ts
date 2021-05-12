jest.mock("private-api-sdk-node/dist/services/confirmation-statement");
jest.mock("private-api-sdk-node/");

import {SignInInfoKeys} from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import {createConfirmationStatement, createOAuthApiClient}
    from "../../src/services/confirmation.statement.service";
import {Session} from "@companieshouse/node-session-handler";

import { ConfirmationStatementService, ConfirmationStatementSubmission }
    from "private-api-sdk-node/dist/services/confirmation-statement";
import {SessionKey} from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import {ISignInInfo} from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import {createPrivateApiClient} from "private-api-sdk-node";

const mockPostNewConfirmationStatement
    = ConfirmationStatementService.prototype.postNewConfirmationStatement as jest.Mock;
const mockCreatePrivateApiClient = createPrivateApiClient as jest.Mock;

const getSessionRequest = (): Session => {
    return new Session({
        [SessionKey.SignInInfo]: {
            [SignInInfoKeys.SignedIn]: 1,
            [SignInInfoKeys.UserProfile]: {id: "j bloggs"},
            [SignInInfoKeys.AccessToken]: {access_token: "token"}
        } as ISignInInfo
    });
}

const transactionId = "12345";


describe("Confirmation statement api service unit tests", () => {

    beforeEach(() => {
        mockCreatePrivateApiClient.mockReturnValue({
            confirmationStatementService: ConfirmationStatementService.prototype
          } as PrivateApiClient
        )
    });

    it("should obtain private node sdk client", () => {
        const client = createOAuthApiClient(getSessionRequest());
        expect(client.confirmationStatementService).not.toBeNull();
    });

    it("should create confirmation statement is called in the private sdk", async () => {
        mockPostNewConfirmationStatement.mockResolvedValueOnce(201);
        const response = await createConfirmationStatement(getSessionRequest(), transactionId);
        expect(response).toEqual(201);
        expect(mockPostNewConfirmationStatement).toBeCalledWith(transactionId);
    });
});
