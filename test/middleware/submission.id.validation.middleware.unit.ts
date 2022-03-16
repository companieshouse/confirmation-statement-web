jest.mock("../../src/validators/url.id.validator");
jest.mock("../../src/middleware/transaction.id.validation.middleware");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/logger");

import mockServiceAvailabilityMiddleware from "../mocks/service.availability.middleware.mock";
import mockAuthenticationMiddleware from "../mocks//authentication.middleware.mock";
import mockSessionMiddleware from "../mocks/session.middleware.mock";
import mockCompanyAuthenticationMiddleware from "../mocks/company.authentication.middleware.mock";
import mockIsPscQueryParameterValidationMiddleware from "../mocks/is.psc.validation.middleware.mock";
import mockCompanyNumberQueryParameterValidationMiddleware from "../mocks/company.number.validation.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { isUrlIdValid } from "../../src/validators/url.id.validator";
import { transactionIdValidationMiddleware } from "../../src/middleware/transaction.id.validation.middleware";
import { NextFunction } from "express";
import { TRADING_STATUS_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { logger } from "../../src/utils/logger";


const mockIsUrlIdValid = isUrlIdValid as jest.Mock;

const mockTransactionIdValidationMiddleware = transactionIdValidationMiddleware as jest.Mock;
mockTransactionIdValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;

const TRUNCATED_LENGTH = 50;
const TRADING_STATUS_PAGE_HEADING = "Check the trading status";
const COMPANY_NUMBER = "12345678";
const COMPANY_NUMBER_INVALID = "12345678876888787768886876876876878768876876876876876";
const TRANSACTION_ID = "111905-476716-457831";
const TRANSACTION_ID_INVALID = "111905-476716-45783156654645645645645645645654645645645645645645643";
const SUBMISSION_ID_VALID = "8686876876ds6fds6fsd87f686";
const SUBMISSION_ID_INVALID = "3223432kjh32kh42342344332443232b32j4jk32h43k2h4k233k2jh43k2h4-h32jhg4j2g4jh23gh4";


describe("Submission ID validation middleware tests", () => {

  beforeEach(() => {
    mockServiceAvailabilityMiddleware.mockClear();
    mockAuthenticationMiddleware.mockClear();
    mockSessionMiddleware.mockClear();
    mockCompanyAuthenticationMiddleware.mockClear();
    mockIsPscQueryParameterValidationMiddleware.mockClear();
    mockCompanyNumberQueryParameterValidationMiddleware.mockClear();
    mockIsUrlIdValid.mockClear();
    mockTransactionIdValidationMiddleware.mockClear();
    mockLoggerErrorRequest.mockClear();
  });

  it("Should stop invalid submission id", async () => {
    const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";
    mockIsUrlIdValid.mockReturnValueOnce(false);
    const spyTruncateRequestUrl = jest.spyOn(urlUtils, "sanitiseReqUrls");

    const urlWithInvalidSubId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID_INVALID);
    const response = await request(app).get(urlWithInvalidSubId);

    expect(spyTruncateRequestUrl).toBeCalledTimes(1);
    expect(isUrlIdValid).toBeCalledWith(SUBMISSION_ID_INVALID);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(SUBMISSION_ID_INVALID.substring(0, TRUNCATED_LENGTH));
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain(ERROR_PAGE_TEXT);

    spyTruncateRequestUrl.mockRestore();
  });

  it("Should not stop valid submission id", async () => {
    mockIsUrlIdValid.mockReturnValueOnce(true);
    const urlWithValidSubId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, COMPANY_NUMBER, TRANSACTION_ID, SUBMISSION_ID_VALID);

    const response = await request(app).get(urlWithValidSubId);

    expect(isUrlIdValid).toBeCalledWith(SUBMISSION_ID_VALID);
    expect(response.text).toContain(TRADING_STATUS_PAGE_HEADING);
    expect(response.statusCode).toEqual(200);
  });

  it("Should truncate all invalid ids", async () => {
    const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";
    const spyTruncateRequestUrl = jest.spyOn(urlUtils, "sanitiseReqUrls");
    mockIsUrlIdValid.mockReturnValueOnce(false);

    const urlWithInvalidTransactionIdSubmissionId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, COMPANY_NUMBER_INVALID, TRANSACTION_ID_INVALID, SUBMISSION_ID_INVALID);
    const response = await request(app).get(urlWithInvalidTransactionIdSubmissionId);

    expect(isUrlIdValid).toBeCalledWith(SUBMISSION_ID_INVALID);
    expect(spyTruncateRequestUrl).toBeCalledTimes(1);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).not.toContain(COMPANY_NUMBER_INVALID);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).not.toContain(SUBMISSION_ID_INVALID);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).not.toContain(TRANSACTION_ID_INVALID);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(COMPANY_NUMBER_INVALID.substring(0, TRUNCATED_LENGTH));
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(TRANSACTION_ID_INVALID.substring(0, TRUNCATED_LENGTH));
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(SUBMISSION_ID_INVALID.substring(0, TRUNCATED_LENGTH));
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain(ERROR_PAGE_TEXT);

    spyTruncateRequestUrl.mockRestore();
  });
});
