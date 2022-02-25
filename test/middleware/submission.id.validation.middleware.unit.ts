jest.mock("../../src/validators/url.id.validator");
jest.mock("../../src/middleware/transaction.id.validation.middleware");
jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { isUrlIdValid } from "../../src/validators/url.id.validator";
import { transactionIdValidationMiddleware } from "../../src/middleware/transaction.id.validation.middleware";
import { NextFunction } from "express";
import { TRADING_STATUS_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";


const mockIsUrlIdValid = isUrlIdValid as jest.Mock;

const mockTransactionIdValidationMiddleware = transactionIdValidationMiddleware as jest.Mock;
mockTransactionIdValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "111905-476716-457831";
const SUBMISSION_ID_VALID = "8686876876ds6fds6fsd87f686";
const SUBMISSION_ID_INVALID = "3223432kjh32kh42342344332443232b32j4jk32h43k2h4k233k2jh43k2h4-h32jhg4j2g4jh23gh4";


describe("Submission ID validation middleware tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockIsUrlIdValid.mockClear();
    mockTransactionIdValidationMiddleware.mockClear();
  });

  it("Should stop invalid submission id", async () => {
    const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";
    mockIsUrlIdValid.mockReturnValueOnce(false);

    const urlWithInvalidSubId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID_INVALID);
    const response = await request(app).get(urlWithInvalidSubId);

    expect(isUrlIdValid).toBeCalledWith(SUBMISSION_ID_INVALID);
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain(ERROR_PAGE_TEXT);
  });

  it("Should not stop valid submission id", async () => {
    mockIsUrlIdValid.mockReturnValueOnce(true);
    const urlWithValidSubId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID_VALID);

    const response = await request(app).get(urlWithValidSubId);

    expect(isUrlIdValid).toBeCalledWith(SUBMISSION_ID_VALID);
    expect(response.statusCode).toEqual(200);
  });
});
