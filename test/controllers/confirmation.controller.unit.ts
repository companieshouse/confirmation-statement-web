import mocks from "../mocks/all.middleware.mock";
import { NextFunction, Request, Response } from "express";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { Session } from "@companieshouse/node-session-handler";
import request from "supertest";
import app from "../../src/app";
import { urlUtils } from "../../src/utils/url";
import { CONFIRMATION_PATH } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { isLimitedPartnershipCompanyType } from "../../src/utils/limited.partnership";
jest.mock("../../src/utils/limited.partnership");
jest.mock("../../src/services/company.profile.service");

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Confirmation";
const LP_PAGE_HEADING = "Confirmation statement submitted";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(CONFIRMATION_PATH,
                                                               COMPANY_NUMBER,
                                                               TRANSACTION_ID,
                                                               SUBMISSION_ID);
const TEST_EMAIL = "test@test.com";

const mockSessionMiddleware = sessionMiddleware as jest.Mock;
mockSessionMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  const session: Session = new Session();
  session.data = {
    signin_info: {
      user_profile: {
        email: TEST_EMAIL,
      },
    },
  };
  req.session = session;
  return next();
});

describe("Confirmation controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show confirmation page", async () => {
    (getCompanyProfile as jest.Mock).mockResolvedValue({
      companyName: "TestCo Ltd"
    });
    (isLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(false);

    const response = await request(app)
      .get(URL);

    expect(response.status).toBe(200);
    expect(response.text).toContain(PAGE_HEADING);
    expect(response.text).toContain(TRANSACTION_ID);
    expect(response.text).toContain(TEST_EMAIL);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should show limited partnership confirmation page", async () => {
    (getCompanyProfile as jest.Mock).mockResolvedValue({
      companyName: "TestCo Ltd"
    });
    (isLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(true);

    const response = await request(app)
      .get(URL);

    expect(response.status).toBe(200);
    expect(response.text).toContain(LP_PAGE_HEADING);
    expect(response.text).toContain("Your reference number <br><strong>" + TRANSACTION_ID + "</strong>");
    expect(response.text).toContain(TEST_EMAIL);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should navigate to error page if error is thrown when getting confirmation page", async () => {
    const spyGetTrans = jest.spyOn(urlUtils, "getTransactionIdFromRequestParams");
    spyGetTrans.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app)
      .get(URL);

    expect(response.text).toContain("Sorry, there is a problem with the service");

    spyGetTrans.mockRestore();
  });
});
