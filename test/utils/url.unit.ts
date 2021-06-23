import { getUrlWithCompanyNumber } from "../../src/utils/url";

describe("url utils tests", () => {

  describe("getUrlWithCompanyNumber tests", () => {
    const COMPANY_NUMBER = "12345678";

    it("should populate a url with a company number", () => {
      const url = "/something/:companyNumber/something";
      const populatedUrl = getUrlWithCompanyNumber(url, COMPANY_NUMBER);
      expect(populatedUrl).toEqual(`/something/${COMPANY_NUMBER}/something`);
    });
  });
});
