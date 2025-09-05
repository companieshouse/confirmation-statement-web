import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { LP_BEFORE_YOU_FILE_PATH, urlParams } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { LIMITED_PARTNERSHIP_COMPANY_TYPE, LIMITED_PARTNERSHIP_SUBTYPES } from "../../src/utils/constants";
import { getTransaction } from "../../src/services/transaction.service";

jest.mock("../../src/services/company.profile.service", () => ({
  getCompanyProfile: jest.fn()
}));

jest.mock("../../src/services/transaction.service", () => ({
  getTransaction: jest.fn()
}));

jest.mock("../../src/utils/payments", () => ({
  isPaymentDue: jest.fn()
}));


const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66454";
const SUBMISSION_ID = "435435";
const URL = LP_BEFORE_YOU_FILE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);


describe("start before you file controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return acsp / limited partnership before you file page page", async () => {
    (getCompanyProfile as jest.Mock).mockResolvedValue({
      companyNumber: COMPANY_NUMBER,
      type: LIMITED_PARTNERSHIP_COMPANY_TYPE,
      subtype: LIMITED_PARTNERSHIP_SUBTYPES.LP,
      companyName: "Test Company"
    });

    (getTransaction as jest.Mock).mockResolvedValue({
      id: TRANSACTION_ID
    });
    const response = await request(app).get(URL);

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain("Before you file the confirmation statement");
  });

  it("should forward to Confirmation Statement Date page", async () => {
    const response = await request(app)
      .post(URL).set('Content-Type', 'application/json')
      .send({
        "byfCheckbox": "confirm",
        "limitedPartnershipSubtype": LIMITED_PARTNERSHIP_SUBTYPES.LP
      });

    expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.status).toBe(302); // Expecting a redirect response
    expect(response.headers.location).toBe("/confirmation-statement/company/12345678/transaction/66454/submission/435435/acsp/confirmation-statement-date?lang=en");
  });
});
