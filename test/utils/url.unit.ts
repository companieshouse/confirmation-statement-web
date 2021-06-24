import { urlParams } from "../../src/types/page.urls";
import { getUrlWithCompanyNumber } from "../../src/utils/url";

describe("url utils tests", () => {

  describe("getUrlWithCompanyNumber tests", () => {
    const COMPANY_NUMBER = "12345678";

    it("should populate a url with a company number", () => {
      const url = `/something/:${urlParams.PARAM_COMPANY_NUMBER}/something`;
      const populatedUrl = getUrlWithCompanyNumber(url, COMPANY_NUMBER);
      expect(populatedUrl).toEqual(`/something/${COMPANY_NUMBER}/something`);
    });
  });
});
