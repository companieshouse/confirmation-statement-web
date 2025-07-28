import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { IAccessToken, ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";

export const getSessionRequest = (accessToken?: IAccessToken): Session => {
  return new Session({
    [SessionKey.SignInInfo]: {
      [SignInInfoKeys.SignedIn]: 1,
      [SignInInfoKeys.UserProfile]: { id: "j bloggs" },
      [SignInInfoKeys.AccessToken]: accessToken
    } as ISignInInfo
  });
};

export const getEmptySessionRequest = (): Session => {
  return new Session();
};

import { Request, Response, NextFunction } from "express";
import mocks from "../mocks/all.middleware.mock";

export const setCompanyTypeAndAcspNumberInSession = (companyType: string, acspNumber: string) => {
  mocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        acsp_number: acspNumber
      },
      extra_data: {
        company_profile: {
          type: companyType
        }
      }
    };
    req.session = session;
    return next();
  });
};