import { createPrivateApiClient } from "private-api-sdk-node";
import {Session} from "@companieshouse/node-session-handler";
import {SignInInfoKeys} from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import {AccessTokenKeys} from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import {SessionKey} from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import logger from "../utils/logger";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import {CHS_API_KEY, INTERNAL_API_URL} from "../utils/properties";
import {ConfirmationStatementService} from "private-api-sdk-node/dist/services/confirmation-statement";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";

export const createConfirmationStatement = async (session: Session,
                                                  transactionId: string): Promise<Resource<any>> => {
    const client = createOAuthApiClient(session);
    const csService: ConfirmationStatementService = client.confirmationStatementService;
    return await csService.postNewConfirmationStatement(transactionId);
}

export const createOAuthApiClient = (session: Session): PrivateApiClient => {
    const signInInfo = session.data?.[SessionKey.SignInInfo];
    if(signInInfo) {
        const oAuth: string = signInInfo?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken] as string;
        if (oAuth) {
            return createPrivateApiClient(CHS_API_KEY, oAuth, INTERNAL_API_URL);
        }
    }
    return logAndThrowError(new Error ("Error getting session keys"));
};

const logAndThrowError = (error: Error) => {
    logger.error(`${error.message} - ${error.stack}`);
    throw error;
};
