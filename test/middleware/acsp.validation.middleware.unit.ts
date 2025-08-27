import { acspValidationMiddleware } from "../../src/middleware/acsp.validation.middleware";
import { LP_CHECK_YOUR_ANSWER_PATH, LP_BEFORE_YOU_FILE_PATH, TRADING_STATUS_PATH, urlParams } from "../../src/types/page.urls";
import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE, LIMITED_PARTNERSHIP_SUBTYPES } from "../../src/utils/constants";
import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const ACSP_NUMBER = "TSA001";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL_LP_BEFORE = LP_BEFORE_YOU_FILE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const URL_LP_CHECK = LP_CHECK_YOUR_ANSWER_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const URL_CS_JOURNEY = TRADING_STATUS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);


middlewareMocks.mockAcspValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  acspValidationMiddleware(req, res, next);
});

middlewareMocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  const session: Session = new Session();
  session.data = {
    signin_info: {
      acsp_number: ACSP_NUMBER
    },
    extra_data: {
      company_profile: {
        type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
        subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP
      }
    }
  };
  req.session = session;
  return next();
});

describe("start ACSP validation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("acspValidationMiddleware should redirect to LP before you file page if user is ACSP member and LP type", async () => {
    setCompanyTypeAndAcspNumberInSession(LIMITED_PARTNERSHIP_COMPANY_TYPE, ACSP_NUMBER, LIMITED_PARTNERSHIP_SUBTYPES.LP);
    const response = await request(app).get(URL_LP_BEFORE);

    expect(middlewareMocks.mockAcspValidationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain("Before you file a confirmation statement");
  });

  it("acspValidationMiddleware should redirect to LP check your answer page if user is ACSP member and LP subtype", async () => {
    setCompanyTypeAndAcspNumberInSession(LIMITED_PARTNERSHIP_COMPANY_TYPE, ACSP_NUMBER, LIMITED_PARTNERSHIP_SUBTYPES.SLP);
    const response = await request(app).get(URL_LP_CHECK);

    expect(middlewareMocks.mockAcspValidationMiddleware).toHaveBeenCalled();
    expect(response.headers.location).toBe("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/confirmation-statement-date?lang=en");
  });

  it("acspValidationMiddleware should redirect to LP stop screen if user is non ACSP member", async () => {
    setCompanyTypeAndAcspNumberInSession(LIMITED_PARTNERSHIP_COMPANY_TYPE, "", LIMITED_PARTNERSHIP_SUBTYPES.LP);
    const response = await request(app).get(URL_LP_CHECK);

    expect(middlewareMocks.mockAcspValidationMiddleware).toHaveBeenCalled();
    expect(response.headers.location).toBe("/confirmation-statement/acsp/must-be-authorised-agent");
  });

  it("acspValidationMiddleware should redirect to LP stop screen if company profile is empty and user is non ACSP member ", async () => {
    setCompanyTypeAndAcspNumberInSession("", "");
    const response = await request(app).get(URL_LP_CHECK);

    expect(middlewareMocks.mockAcspValidationMiddleware).toHaveBeenCalled();
    expect(response.headers.location).toBe("/confirmation-statement/acsp/must-be-authorised-agent");
  });

  it("acspValidationMiddleware should redirect to service offline screen if company type is empty and user is ACSP member ", async () => {
    setCompanyTypeAndAcspNumberInSession("", ACSP_NUMBER);
    const response = await request(app).get(URL_LP_CHECK);

    expect(middlewareMocks.mockAcspValidationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });

  it("acspValidationMiddleware should not be called if the URL is not part of ACSP journey and user is non ACSP member", async () => {
    setCompanyTypeAndAcspNumberInSession("ltd", "");
    const response = await request(app).get(URL_CS_JOURNEY);

    expect(middlewareMocks.mockAcspValidationMiddleware).not.toHaveBeenCalled();
    expect(response.text).toContain("Is the trading status of shares correct?");
  });

  it("acspValidationMiddleware should not be called if the URL is not part of ACSP journey and user is ACSP member", async () => {
    setCompanyTypeAndAcspNumberInSession("ltd", ACSP_NUMBER);
    const response = await request(app).get(URL_CS_JOURNEY);

    expect(middlewareMocks.mockAcspValidationMiddleware).not.toHaveBeenCalled();
    expect(response.text).toContain("Is the trading status of shares correct?");
  });
});

function setCompanyTypeAndAcspNumberInSession(companyType: string, acspNumber: string, companySubtype?: string) {
  middlewareMocks.mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
    const session: Session = new Session();
    session.data = {
      signin_info: {
        acsp_number: acspNumber
      },
      extra_data: {
        company_profile: {
          type: companyType,
          subtype: companySubtype
        }
      }
    };
    req.session = session;
    return next();
  });
}
