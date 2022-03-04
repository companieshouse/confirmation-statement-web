jest.mock("../../src/validators/url.id.validator");
jest.mock("../../src/middleware/submission.id.validation.middleware");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/logger");

import mockServiceAvailabilityMiddleware from "../mocks/service.availability.middleware.mock";
import mockAuthenticationMiddleware from "../mocks/authentication.middleware.mock";
import mockSessionMiddleware from "../mocks/session.middleware.mock";
import mockCompanyAuthenticationMiddleware from "../mocks/company.authentication.middleware.mock";
import mockIsPscQueryParameterValidationMiddleware from "../mocks/is.psc.validation.middleware.mock";
import mockCompanyNumberQueryParameterValidationMiddleware from "../mocks/company.number.validation.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { isUrlIdValid } from "../../src/validators/url.id.validator";
import { submissionIdValidationMiddleware } from "../../src/middleware/submission.id.validation.middleware";
import { NextFunction } from "express";
import { TRADING_STATUS_PATH } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { logger } from "../../src/utils/logger";

const mockIsUrlIdValid = isUrlIdValid as jest.Mock;

const mockSubmissionIdValidationMiddleware = submissionIdValidationMiddleware as jest.Mock;
mockSubmissionIdValidationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID_VALID = "111905-476716-457831";
const TRANSACTION_ID_INVALID = "454543543543534-5435435345-34543543545435-435435435435345-345435435345-54355";
const SUBMISSION_ID = "8686876876ds6fds6fsd87f686";
const TRUNCATED_LENGTH = 50;
const TRADING_STATUS_PAGE_HEADING = "Check the trading status";


describe("Transaction ID validation middleware tests", () => {

  beforeEach(() => {
    mockServiceAvailabilityMiddleware.mockClear();
    mockAuthenticationMiddleware.mockClear();
    mockCompanyAuthenticationMiddleware.mockClear();
    mockSessionMiddleware.mockClear();
    mockIsPscQueryParameterValidationMiddleware.mockClear();
    mockCompanyNumberQueryParameterValidationMiddleware.mockClear();
    mockIsUrlIdValid.mockClear();
    mockSubmissionIdValidationMiddleware.mockClear();
    mockLoggerErrorRequest.mockClear();
  });

  it("Should stop invalid transaction id", async () => {
    const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";
    const spyTruncateRequestUrl = jest.spyOn(urlUtils, "sanitiseReqlUrls");
    mockIsUrlIdValid.mockReturnValueOnce(false);

    const urlWithInvalidTransactionId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, COMPANY_NUMBER, TRANSACTION_ID_INVALID, SUBMISSION_ID);
    const response = await request(app).get(urlWithInvalidTransactionId);

    expect(isUrlIdValid).toBeCalledWith(TRANSACTION_ID_INVALID);
    expect(spyTruncateRequestUrl).toBeCalledTimes(1);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(TRANSACTION_ID_INVALID.substring(0, TRUNCATED_LENGTH));
    expect(response.statusCode).toEqual(400);
    expect(response.text).toContain(ERROR_PAGE_TEXT);

    spyTruncateRequestUrl.mockRestore();
  });

  it("Should not stop valid transaction id", async () => {
    mockIsUrlIdValid.mockReturnValueOnce(true);
    const urlWithValidSubId = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, COMPANY_NUMBER, TRANSACTION_ID_VALID, SUBMISSION_ID);

    const response = await request(app).get(urlWithValidSubId);

    expect(isUrlIdValid).toBeCalledWith(TRANSACTION_ID_VALID);
    expect(response.statusCode).toEqual(200);
    expect(response.text).toContain(TRADING_STATUS_PAGE_HEADING);
  });
});
