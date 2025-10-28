import mocks from "../mocks/all.middleware.mock";
import { NextFunction, Request, Response } from "express";
import { sessionMiddleware } from "../../src/middleware/session.middleware";
import { Session } from "@companieshouse/node-session-handler";
import request from "supertest";
import app from "../../src/app";
import { urlUtils } from "../../src/utils/url";
import { CONFIRMATION_PATH, LP_CONFIRMATION_PATH } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { isLimitedPartnershipCompanyType } from "../../src/utils/limited.partnership";
import { resetAcspSession } from "../../src/utils/session.acsp";
jest.mock("../../src/utils/limited.partnership");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/session.acsp");

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

const LP_URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(LP_CONFIRMATION_PATH,
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
    extra_data: {
      company_profile: {
        _id: COMPANY_NUMBER,
        company_name: "Test Company",
        sicCodes: ["70001", "70002", "70003"]
      },
      acsp_data: {},
    }
  };
  req.session = session;
  return next();
});

const mockResetAcspSession = resetAcspSession as jest.Mock;

describe("Confirmation controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show confirmation page", async () => {
    (getCompanyProfile as jest.Mock).mockResolvedValue({
      companyName: "TestCo Ltd"
    });
    (isLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(false);

    const response = await request(app).get(URL);

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

    const response = await request(app).get(LP_URL);

    const DIFFERENT_LIMITED_PARTNERSHIP_LINK_URL = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber=%7BcompanyNumber%7D";
    const LIMITED_PARTNERSHIP_OVERVIEW_LINK_URL = "/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/confirmation?overview=true";
    const DIFFERENT_LIMITED_PARTNERSHIP_LINK_TEXT = "File for a different limited partnership";
    const LIMITED_PARTNERSHIP_OVERVIEW_LINK_TEXT = "Return to the overview screen for this limited partnership";

    expect(response.status).toBe(200);
    expect(response.text).toContain(LP_PAGE_HEADING);
    expect(response.text).toContain("Your reference number <br><strong>" + TRANSACTION_ID + "</strong>");
    expect(response.text).toContain(TEST_EMAIL);
    verifyLink(response.text, DIFFERENT_LIMITED_PARTNERSHIP_LINK_URL, DIFFERENT_LIMITED_PARTNERSHIP_LINK_TEXT);
    verifyLink(response.text, LIMITED_PARTNERSHIP_OVERVIEW_LINK_URL, LIMITED_PARTNERSHIP_OVERVIEW_LINK_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it ("Should navigate to Overview page and clear Extra Data with overview query parameter", async () => {
    (getCompanyProfile as jest.Mock).mockResolvedValue({
      companyName: "TestCo Ltd"
    });
    (isLimitedPartnershipCompanyType as jest.Mock).mockReturnValue(true);

    const OVERVIEW_URL = LP_URL + '?overview=true';
    const response = await request(app).get(OVERVIEW_URL);

    expect(mockResetAcspSession).toHaveBeenCalled();

    const EXPECTED_URL = "/company/12345678/";

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(EXPECTED_URL);
    expect(response.redirect).toBeTruthy();

  });

  it("Should navigate to error page if error is thrown when getting confirmation page", async () => {
    const spyGetTrans = jest.spyOn(urlUtils, "getTransactionIdFromRequestParams");
    spyGetTrans.mockImplementationOnce(() => { throw new Error(); });
    const response = await request(app).get(URL);

    expect(response.text).toContain("Sorry, there is a problem with the service");

    spyGetTrans.mockRestore();
  });

  function verifyLink(responseText: string, url: string, text: string) {

    const VALID_URL_PATTERN = "<a href=\\\"" + regExURLEscape(url) + "\\\".*" + regExURLEscape(text) + ".*</a>";
    const VALID_URL_REGEX = new RegExp(VALID_URL_PATTERN);

    expect(responseText).toMatch(VALID_URL_REGEX);
  }

  function regExURLEscape(url: string) {
    return String(url).replace(/([.*+^=!:${}()|[\]/\\]|\?)/g, '\\$1');
  }
});
