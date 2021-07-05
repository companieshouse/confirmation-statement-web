import { Session } from "@companieshouse/node-session-handler";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { createPrivateApiClient } from "private-api-sdk-node";
import { INTERNAL_API_URL } from "../utils/properties";
import { createAndLogError } from "../utils/logger";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

export const createPrivateOAuthApiClient = (session: Session): PrivateApiClient => {
  const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
  if (oAuth) {
    return createPrivateApiClient(undefined, oAuth, INTERNAL_API_URL);
  }
  throw createAndLogError("Error getting session keys for creating private api client");
};

export const createPublicOAuthApiClient = (session: Session): ApiClient => {
  const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
  if (oAuth) {
    return createApiClient(undefined, oAuth, INTERNAL_API_URL);
  }
  throw createAndLogError("Error getting session keys for creating public api client");
};
