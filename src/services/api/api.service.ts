import { Session } from "@companieshouse/node-session-handler";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { createPrivateApiClient } from "private-api-sdk-node";
import { INTERNAL_API_URL } from "../../utils/properties";
import { logAndThrowError } from "../../utils/logger";

export const createOAuthApiClient = (session: Session): PrivateApiClient => {
  const signInInfo = session.data?.[SessionKey.SignInInfo];
  if (signInInfo) {
    const oAuth: string = signInInfo?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken] as string;
    if (oAuth) {
      return createPrivateApiClient(undefined, oAuth, INTERNAL_API_URL);
    }
  }
  return logAndThrowError(new Error ("Error getting session keys for creating api client"));
};
