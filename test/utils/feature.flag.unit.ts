jest.mock("../../src/services/confirmation.statement.service");

import { ecctDayOneEnabled, isActiveFeature } from "../../src/utils/feature.flag";

const PropertiesMock = jest.requireMock('../../src/utils/properties');
jest.mock('../../src/utils/properties', () => ({
  ...jest.requireActual('../../src/utils/properties'),
}));

describe("feature flag tests", function() {

  describe("active feature tests", function() {

    it("should return false if variable is 'false'", function() {
      const active = isActiveFeature("false");
      expect(active).toBeFalsy;
    });

    it("should return false if variable is '0'", function() {
      const active = isActiveFeature("0");
      expect(active).toBeFalsy;
    });

    it("should return false if variable is ''", function() {
      const active = isActiveFeature("");
      expect(active).toBeFalsy;
    });

    it("should return false if variable is undefined", function() {
      const active = isActiveFeature(undefined);
      expect(active).toBeFalsy;
    });

    it("should return true if variable is random", function() {
      const active = isActiveFeature("kdjhskjf");
      expect(active).toBeTruthy;
    });

    it("should return false if variable is 'off'", function() {
      const active = isActiveFeature("off");
      expect(active).toBeFalsy;
    });

    it("should return false if variable is 'OFF'", function() {
      const active = isActiveFeature("OFF");
      expect(active).toBeFalsy;
    });

    it("should return true if variable is 'on'", function() {
      const active = isActiveFeature("on");
      expect(active).toBeTruthy;
    });

    it("should return true if variable is 'true'", function() {
      const active = isActiveFeature("true");
      expect(active).toBeTruthy;
    });

    it("should return true if variable is 'TRUE'", function() {
      const active = isActiveFeature("TRUE");
      expect(active).toBeTruthy;
    });

    it("should return true if variable is '1'", function() {
      const active = isActiveFeature("1");
      expect(active).toBeTruthy;
    });

  });

  describe("ECCT Day One enablement tests", function() {

    it("should return false if supplied date is before ECCT start date", () => {
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2022-04-01";
      const supplyDate = new Date("2022-02-20");
      const ecctEnabled = ecctDayOneEnabled(supplyDate);
      expect(ecctEnabled).toEqual(false);
    });

    it("should return true if supplied date is the same as ECCT start date", function() {
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2022-04-01";
      const supplyDate = new Date("2022-04-01");
      const ecctEnabled = ecctDayOneEnabled(supplyDate);
      expect(ecctEnabled).toEqual(true);
    });

    it("should return true if supplied date is past ECCT start date", function() {
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2022-04-01";
      const supplyDate = new Date("2023-10-27");
      const ecctEnabled = ecctDayOneEnabled(supplyDate);
      expect(ecctEnabled).toEqual(true);
    });

    it("should return an error if ECCT start date is invalid", function() {
      PropertiesMock.FEATURE_FLAG_ECCT_START_DATE_14082023 = "2022-99-99";
      const supplyDate = new Date("2023-10-27");
      const ecctEnabled = ecctDayOneEnabled(supplyDate);
      expect(ecctEnabled).toEqual(false);
    });
  });

});
