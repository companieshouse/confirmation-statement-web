import { request } from "express";
import { urlParams } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";

describe("url utils tests", () => {
  const COMPANY_NUMBER = "12345678";
  const TX_ID = "987654321";
  const SUB_ID = "1234-abcd";
  const urlWithParams = `/something/:${urlParams.PARAM_COMPANY_NUMBER}/something/transaction/:${urlParams.PARAM_TRANSACTION_ID}/submission/:${urlParams.PARAM_SUBMISSION_ID}/andThenSome`;
  const req = request;

  beforeEach(() => {
    req["params"] = {
      [urlParams.PARAM_COMPANY_NUMBER]: COMPANY_NUMBER,
      [urlParams.PARAM_TRANSACTION_ID]: TX_ID,
      [urlParams.PARAM_SUBMISSION_ID]: SUB_ID
    };
  });

  describe("getUrlWithCompanyNumber tests", () => {

    it("should populate a url with a company number", () => {
      const url = `/something/:${urlParams.PARAM_COMPANY_NUMBER}/something`;
      const populatedUrl = urlUtils.getUrlWithCompanyNumber(url, COMPANY_NUMBER);
      expect(populatedUrl).toEqual(`/something/${COMPANY_NUMBER}/something`);
    });
  });

  describe("getUrlToPath tests", () => {

    it("Should populate the Url with the company number, transaction ID and submission ID from the request params", () => {
      const populatedUrl = urlUtils.getUrlToPath(urlWithParams, req);
      expect(populatedUrl).toEqual(`/something/${COMPANY_NUMBER}/something/transaction/${TX_ID}/submission/${SUB_ID}/andThenSome`);
    });

  });

  describe("getUrlWithCompanyNumberTransactionIdAndSubmissionId tests", () => {

    it("Should the Url with the company number, transaction ID and submission ID", () => {
      const populatedUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(urlWithParams, COMPANY_NUMBER, TX_ID, SUB_ID);
      expect(populatedUrl).toEqual(`/something/${COMPANY_NUMBER}/something/transaction/${TX_ID}/submission/${SUB_ID}/andThenSome`);
    });
  });

  describe("Request param tests", () => {

    it("Should get the company number from the Url", () => {
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      expect(companyNumber).toEqual(COMPANY_NUMBER);
    });

    it("Should get the transaction ID from the Url", () => {
      const txId = urlUtils.getTransactionIdFromRequestParams(req);
      expect(txId).toEqual(TX_ID);
    });

    it("Should get the subscriptionn ID from the Url", () => {
      const subId = urlUtils.getSubmissionIdFromRequestParams(req);
      expect(subId).toEqual(SUB_ID);
    });
  });


});
