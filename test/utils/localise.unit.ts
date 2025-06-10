import { addLangToUrl } from "../../src/utils/localise";


describe("Test localise", () => {
  test("Test addLangToUrl with url without queries and lang set", () => {
    const URL = "test.test.url";
    const LANG = "lang";
    const RESULT = URL + "?lang=" + LANG;
    expect(addLangToUrl(URL, LANG)).toBe(RESULT);
  });
  test("Test addLangToUrl with url with queries and lang set", () => {
    const URL = "test.test.url?foo=bar";
    const LANG = "lang";
    const RESULT = URL + "&lang=" + LANG;
    expect(addLangToUrl(URL, LANG)).toBe(RESULT);
  });
  test("Test addLangToUrl with url without queries and no lang set", () => {
    const URL = "test.test.url";
    expect(addLangToUrl(URL, undefined)).toBe(URL);
  });
});
