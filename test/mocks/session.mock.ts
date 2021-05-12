import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";

export const getSessionRequest = (): Session => {
  return new Session({
    [SessionKey.SignInInfo]: {
      [SignInInfoKeys.SignedIn]: 1,
      [SignInInfoKeys.UserProfile]: { id: "j bloggs" },
      [SignInInfoKeys.AccessToken]: { access_token: "token" }
    } as ISignInInfo
  });
};
