import { testingOnly } from "../../src/utils/properties";
const { getEnvironmentVariable } = testingOnly;

describe("Properties tests", () => {

  describe("getEnvironmentVariable tests", () => {

    it("Should return environment variable", () => {
      const varName = "ENV_VAR_TEST";
      const varVal = "hello";
      process.env[varName] = varVal;

      const returned: string = getEnvironmentVariable(varName);

      expect(returned).toEqual<string>(varVal);
    });

    it("Should throw error if environment variable not found", () => {
      expect(() => getEnvironmentVariable("missing"))
        .toThrow('Please set the environment variable "missing"');
    });

    it("Should return default value if environment variable not found", () => {
      const defaultValue = "55";
      const envVar: string = getEnvironmentVariable("missing", defaultValue);
      expect(envVar).toEqual<string>(defaultValue);
    });
  });
});
