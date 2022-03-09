jest.mock("../../src/utils/properties", () => {
  return {
    URL_LOG_MAX_LENGTH: 100,
    URL_PARAM_MAX_LENGTH: 10
  };
});

import { request } from "express";
import { urlParams, URL_QUERY_PARAM } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";

describe("url utils tests", () => {
  const COMPANY_NUMBER = "12345678";
  const TX_ID = "987654321";
  const SUB_ID = "1234-abcd";
  const urlWithParams = `/company/:${urlParams.PARAM_COMPANY_NUMBER}/something/transaction/:${urlParams.PARAM_TRANSACTION_ID}/submission/:${urlParams.PARAM_SUBMISSION_ID}/andThenSome`;
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
      expect(populatedUrl).toEqual(`/company/${COMPANY_NUMBER}/something/transaction/${TX_ID}/submission/${SUB_ID}/andThenSome`);
    });

  });

  describe("getUrlWithCompanyNumberTransactionIdAndSubmissionId tests", () => {

    it("Should the Url with the company number, transaction ID and submission ID", () => {
      const populatedUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(urlWithParams, COMPANY_NUMBER, TX_ID, SUB_ID);
      expect(populatedUrl).toEqual(`/company/${COMPANY_NUMBER}/something/transaction/${TX_ID}/submission/${SUB_ID}/andThenSome`);
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

    it("Should get the subscription ID from the Url", () => {
      const subId = urlUtils.getSubmissionIdFromRequestParams(req);
      expect(subId).toEqual(SUB_ID);
    });
  });

  describe("setQueryParam tests", () => {
    it("Should replace query param", () => {
      const url = `something?${URL_QUERY_PARAM.IS_PSC}={${URL_QUERY_PARAM.IS_PSC}}`;
      const newUrl = urlUtils.setQueryParam(url, URL_QUERY_PARAM.IS_PSC, "test");
      expect(newUrl).toBe(`something?${URL_QUERY_PARAM.IS_PSC}=test`);
    });
  });

  describe("sanitiseReqlUrls tests", () => {
    it("Should truncate the request urls", () => {
      const tooLongUrl = "http://something/something/something/12344/somethingelse/andAnotherThing/12345/somethingElse/something/something";
      req.url = tooLongUrl;
      req.originalUrl = tooLongUrl;
      urlUtils.sanitiseReqlUrls(req);
      expect(req.url).toEqual("http://something/something/something/12344/somethingelse/andAnotherThing/12345/somethingElse/somethi...");
      expect(req.originalUrl).toEqual("http://something/something/something/12344/somethingelse/andAnotherThing/12345/somethingElse/somethi...");
    });

    it("Should not truncate the request urls", () => {
      const okUrl = "http://something/something";
      req.url = okUrl;
      req.originalUrl = okUrl;
      urlUtils.sanitiseReqlUrls(req);
      expect(req.url).toEqual("http://something/something");
      expect(req.originalUrl).toEqual("http://something/something");
    });

    it("Should do nothing to urls if undefined", () => {
      req.url = undefined as unknown as string;
      req.originalUrl = undefined as unknown as string;
      urlUtils.sanitiseReqlUrls(req);
      expect(req.url).toEqual("undefined");
      expect(req.originalUrl).toEqual("undefined");
    });

    it("Should truncate url params if they are too long", () => {
      const txnId = "328433824632874673246782";
      const subId = "93984328472384389247432432";
      const companyNumber = "58584883848489445";
      req.params[urlParams.PARAM_TRANSACTION_ID] = txnId;
      req.params[urlParams.PARAM_SUBMISSION_ID] = subId;
      req.params[urlParams.PARAM_COMPANY_NUMBER] = companyNumber;
      const populatedUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(urlWithParams, companyNumber, txnId, subId);
      req.url = populatedUrl;
      req.originalUrl = populatedUrl;

      urlUtils.sanitiseReqlUrls(req);

      expect(req.url).toEqual("/company/5858488384.../something/transaction/3284338246.../submission/9398432847.../andThenSome");
      expect(req.originalUrl).toEqual("/company/5858488384.../something/transaction/3284338246.../submission/9398432847.../andThenSome");
    });

    it("Should truncate url query params if they are too long", () => {
      // make a copy of the req.query so we can set it back at end of test
      const originalReqQuery = req.query;
      const param1Value = "3sdsdsdfsdfsdfsd4673246782";
      const param2Value = "sdfsdfsdfds72384389247432432";
      // need to set the req.query object values as well as in the url
      // as the sanitiseReqlUrls function will examine the req.query object to determine
      // what query params are present in the url
      req.query = {
        param1: param1Value,
        param2: param2Value
      };

      const populatedUrl = `/something?param1=${param1Value}&param2=${param2Value}`;
      req.url = populatedUrl;
      req.originalUrl = populatedUrl;

      urlUtils.sanitiseReqlUrls(req);

      // restore the req.query as it was before this test
      req.query = originalReqQuery;

      expect(req.url).toEqual("/something?param1=3sdsdsdfsd...&param2=sdfsdfsdfd...");
      expect(req.originalUrl).toEqual("/something?param1=3sdsdsdfsd...&param2=sdfsdfsdfd...");
    });

    it("Should encode special characters in the request urls", () => {
      const urlWithSpecialCharacters = "http://something/something{}  |`]";
      req.url = urlWithSpecialCharacters;
      req.originalUrl = urlWithSpecialCharacters;
      urlUtils.sanitiseReqlUrls(req);
      expect(req.url).toEqual("http://something/something%7B%7D%20%20%7C%60%5D");
      expect(req.originalUrl).toEqual("http://something/something%7B%7D%20%20%7C%60%5D");
    });


    it("Should not encode reserved characters in the request urls", () => {
      const urlWithSpecialCharacters = "http://something/something;,/?:@&=+$#";
      req.url = urlWithSpecialCharacters;
      req.originalUrl = urlWithSpecialCharacters;
      urlUtils.sanitiseReqlUrls(req);
      expect(req.url).toEqual("http://something/something;,/?:@&=+$#");
      expect(req.originalUrl).toEqual("http://something/something;,/?:@&=+$#");
    });
  });

});
