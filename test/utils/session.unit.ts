import { Session } from "@companieshouse/node-session-handler";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import * as sessionUtil from "../../src/utils/session";
import { COMPANY_PROFILE_SESSION_KEY, LIMITED_PARTNERSHIP_COMPANY_TYPE } from "../../src/utils/constants";
import { Request } from "express";

export const USER_EMAIL = "userEmail@companieshouse.gov.uk";
export const USER_ID = "testUserID";
export const ACSP_NUMBER = "123456";
export const ACSP_ROLE = "owner";
export const ACCESS_TOKEN_MOCK: IAccessToken = { [AccessTokenKeys.AccessToken]: "accessToken" };
export const REFRESH_TOKEN_MOCK: IAccessToken = { [AccessTokenKeys.RefreshToken]: "refreshToken" };

const sessionData: Session = new Session({
  [SessionKey.SignInInfo]: {
    [SignInInfoKeys.SignedIn]: 1,
    [SignInInfoKeys.UserProfile]: { [UserProfileKeys.Email]: USER_EMAIL, [UserProfileKeys.UserId]: USER_ID },
    [SignInInfoKeys.AcspNumber]: ACSP_NUMBER,
    [SignInInfoKeys.AcspRole]: ACSP_ROLE,
    [SignInInfoKeys.AccessToken]: {
      ...ACCESS_TOKEN_MOCK,
      ...REFRESH_TOKEN_MOCK
    }
  },
  [SessionKey.ExtraData]: {
    [COMPANY_PROFILE_SESSION_KEY]: {
      "type": LIMITED_PARTNERSHIP_COMPANY_TYPE
    }
  }
});

describe("Session util tests", () => {
  it("getSignInInfo should return sigin information", () => {
    const res = sessionUtil.getSignInInfo(sessionData);

    expect(res.acsp_role).toBe(ACSP_ROLE);
    expect(res.user_profile?.id).toBe(USER_ID);
    expect(res.user_profile?.email).toContain(USER_EMAIL);
  });

  it("getLoggedInAcspNumber should return acsp number", () => {
    const res = sessionUtil.getLoggedInAcspNumber(sessionData);

    expect(res).toBe(ACSP_NUMBER);
  });

  it("getCompanyProfileFromSession should return company profile data from session", () => {
    const expectedResCompanyProfile = { "type": LIMITED_PARTNERSHIP_COMPANY_TYPE };
    const res = sessionUtil.getCompanyProfileFromSession({ session: sessionData } as Request);

    expect(res).toEqual(expectedResCompanyProfile);
  });

});
