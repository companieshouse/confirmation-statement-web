
import { Session } from "@companieshouse/node-session-handler";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import * as limitedPartnershipUtil from "../../src/utils/limited.partnership";
import { COMPANY_PROFILE_SESSION_KEY,
  LIMITED_PARTNERSHIP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_LP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_PFLP_COMPANY_TYPE,
  LIMITED_PARTNERSHIP_SPFLP_COMPANY_TYPE } from "../../src/utils/constants";
import { Request } from "express";
import { getCompanyProfileFromSession } from "../../src/utils/session";

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

describe("Limited partnership util tests", () => {
  it("isLimitedPartnershipCompanyType should return true if the company type is limited-partnership", () => {
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeTruthy();
  });

  it("isLimitedPartnershipCompanyType should return false if the company type is empty string", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": "" });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isLimitedPartnershipCompanyType should return false if the session extra data have empty company profile data", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, {});
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isLimitedPartnershipCompanyType should return false if the session extra data have undefined value", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, undefined);
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isLimitedPartnershipCompanyType should return false if the company type is not limited partnership", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": "ltd" });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isLimitedPartnershipCompanyType should return false if the company type is incorrect limitied partnership type", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": "limited-partnership-testing" });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isStandardLimitedPartnershipCompanyType should return true if the company type is limited-partnership", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": LIMITED_PARTNERSHIP_COMPANY_TYPE });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isStandardLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeTruthy();
  });

  it("isStandardLimitedPartnershipCompanyType should return true if the company type is limited-partnership-lp", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": LIMITED_PARTNERSHIP_LP_COMPANY_TYPE });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isStandardLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeTruthy();
  });

  it("isStandardLimitedPartnershipCompanyType should return false if the company type is not standard limited partnership", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": "limited-partnership-test" });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isStandardLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isSlpLimitedPartnershipCompanyType should return true if the company type is SLP", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": LIMITED_PARTNERSHIP_SLP_COMPANY_TYPE });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isSlpLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeTruthy();
  });

  it("isSlpLimitedPartnershipCompanyType should return false if the company type is not SLP", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": "limited-partnership-test" });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isSlpLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isPflpLimitedPartnershipCompanyType should return true if the company type is PFLP", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": LIMITED_PARTNERSHIP_PFLP_COMPANY_TYPE });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isPflpLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeTruthy();
  });

  it("isPflpLimitedPartnershipCompanyType should return false if the company type is not PFLP", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": "limited-partnership-test" });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isPflpLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

  it("isSpflpLimitedPartnershipCompanyType should return true if the company type is SPFLP", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": LIMITED_PARTNERSHIP_SPFLP_COMPANY_TYPE });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isSpflpLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeTruthy();
  });

  it("isSpflpLimitedPartnershipCompanyType should return false if the company type is not SPFLP", () => {
    sessionData.setExtraData(COMPANY_PROFILE_SESSION_KEY, { "type": "limited-partnership-test" });
    const companyProfile = getCompanyProfileFromSession({ session: sessionData } as Request);
    const res = limitedPartnershipUtil.isSpflpLimitedPartnershipCompanyType(companyProfile);

    expect(res).toBeFalsy();
  });

});
