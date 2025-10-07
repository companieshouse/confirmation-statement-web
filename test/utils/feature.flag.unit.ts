jest.mock("../../src/services/confirmation.statement.service");

import { ecctDayOneEnabled,
  isActiveFeature,
  isLimitedPartnershipFeatureEnabled,
  isScottishLimitedPartnershipFeatureEnabled,
  isPrivateFundLimitedPartnershipFeatureEnabled,
  isScottishPrivateFundLimitedPartnershipFeatureEnabled,
  isServiceWithdrawnFeatureEnabled
} from "../../src/utils/feature.flag";

const PropertiesMock = jest.requireMock('../../src/utils/properties');
jest.mock('../../src/utils/properties', () => ({
  ...jest.requireActual('../../src/utils/properties'),
}));

describe("feature flag tests", function() {

  describe("active feature tests", function() {

    it("should return false if variable is 'false'", function() {
      const active = isActiveFeature("false");
      expect(active).toBeFalsy();
    });

    it("should return false if variable is '0'", function() {
      const active = isActiveFeature("0");
      expect(active).toBeFalsy();
    });

    it("should return false if variable is ''", function() {
      const active = isActiveFeature("");
      expect(active).toBeFalsy();
    });

    it("should return false if variable is undefined", function() {
      const active = isActiveFeature(undefined);
      expect(active).toBeFalsy();
    });

    it("should return true if variable is random", function() {
      const active = isActiveFeature("kdjhskjf");
      expect(active).toBeTruthy();
    });

    it("should return false if variable is 'off'", function() {
      const active = isActiveFeature("off");
      expect(active).toBeFalsy();
    });

    it("should return false if variable is 'OFF'", function() {
      const active = isActiveFeature("OFF");
      expect(active).toBeFalsy();
    });

    it("should return true if variable is 'on'", function() {
      const active = isActiveFeature("on");
      expect(active).toBeTruthy();
    });

    it("should return true if variable is 'true'", function() {
      const active = isActiveFeature("true");
      expect(active).toBeTruthy();
    });

    it("should return true if variable is 'TRUE'", function() {
      const active = isActiveFeature("TRUE");
      expect(active).toBeTruthy();
    });

    it("should return true if variable is '1'", function() {
      const active = isActiveFeature("1");
      expect(active).toBeTruthy();
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

  describe("Limited partnership subtask feature flag tests", function() {

    it("should return false if the date is before LP feature flag start date", () => {
      PropertiesMock.FEATURE_FLAG_LP_SUBTYPE_START_DATE = "2025-01-01";

      const OriginalDate = global.Date;
      const MockDate = class extends OriginalDate {
        constructor(...args: any[]) {
          super();
          if (args.length === 0) {
            return new OriginalDate("2024-05-15");
          }
          return new OriginalDate(...args as [any]);
        }
      };
      global.Date = MockDate as unknown as DateConstructor;

      expect(isLimitedPartnershipFeatureEnabled()).toEqual(false);

      global.Date = OriginalDate;

    });

    it("should return true if the date is the same as LP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_LP_SUBTYPE_START_DATE = "2019-03-01";
      expect(isLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return true if the date is past LP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_LP_SUBTYPE_START_DATE = "2025-08-01";
      expect(isLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return false if LP feature flag start date is invalid", function() {
      PropertiesMock.FEATURE_FLAG_LP_SUBTYPE_START_DATE = "2025-99-99";
      expect(isLimitedPartnershipFeatureEnabled()).toEqual(false);
    });

    it("should return false if the date is before SLP feature flag start date", () => {
      PropertiesMock.FEATURE_FLAG_SLP_SUBTYPE_START_DATE = "2023-01-13";

      const OriginalDate = global.Date;
      const MockDate = class extends OriginalDate {
        constructor(...args: any[]) {
          super();
          if (args.length === 0) {
            return new OriginalDate("2020-11-13");
          }
          return new OriginalDate(...args as [any]);
        }
      };
      global.Date = MockDate as unknown as DateConstructor;

      expect(isScottishLimitedPartnershipFeatureEnabled()).toEqual(false);

      global.Date = OriginalDate;

    });

    it("should return true if the date is the same as SLP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_SLP_SUBTYPE_START_DATE = "2023-05-03";
      expect(isScottishLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return true if the date is past SLP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_SLP_SUBTYPE_START_DATE = "2023-08-19";
      expect(isScottishLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return false if SLP feature flag start date is invalid", function() {
      PropertiesMock.FEATURE_FLAG_SLP_SUBTYPE_START_DATE = "2023-99-99";
      expect(isScottishLimitedPartnershipFeatureEnabled()).toEqual(false);
    });

    it("should return false if the date is before PFLP feature flag start date", () => {
      PropertiesMock.FEATURE_FLAG_PFLP_SUBTYPE_START_DATE = "2025-06-22";

      const OriginalDate = global.Date;
      const MockDate = class extends OriginalDate {
        constructor(...args: any[]) {
          super();
          if (args.length === 0) {
            return new OriginalDate("2025-05-09");
          }
          return new OriginalDate(...args as [any]);
        }
      };
      global.Date = MockDate as unknown as DateConstructor;

      expect(isPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(false);

      global.Date = OriginalDate;

    });

    it("should return true if the date is the same as PFLP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_PFLP_SUBTYPE_START_DATE = "2024-09-23";
      expect(isPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return true if the date is past PFLP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_PFLP_SUBTYPE_START_DATE = "2024-06-16";
      expect(isPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return false if PFLP feature flag start date is invalid", function() {
      PropertiesMock.FEATURE_FLAG_PFLP_SUBTYPE_START_DATE = "2024-99-99";
      expect(isPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(false);
    });

    it("should return false if the date is before SPFLP feature flag start date", () => {
      PropertiesMock.FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE = "2025-01-01";

      const OriginalDate = global.Date;
      const MockDate = class extends OriginalDate {
        constructor(...args: any[]) {
          super();
          if (args.length === 0) {
            return new OriginalDate("2024-05-15");
          }
          return new OriginalDate(...args as [any]);
        }
      };
      global.Date = MockDate as unknown as DateConstructor;

      expect(isScottishPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(false);

      global.Date = OriginalDate;

    });

    it("should return true if the date is the same as SPFLP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE = "2019-03-01";
      expect(isScottishPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return true if the date is past SPFLP feature flag start date", function() {
      PropertiesMock.FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE = "2025-08-01";
      expect(isScottishPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(true);
    });

    it("should return false if SPFLP feature flag start date is invalid", function() {
      PropertiesMock.FEATURE_FLAG_SPFLP_SUBTYPE_START_DATE = "2025-99-99";
      expect(isScottishPrivateFundLimitedPartnershipFeatureEnabled()).toEqual(false);
    });
  });

  // add a test block named "Service Withdrawn feature flag tests"
  describe("Service Withdrawn feature flag tests", () => {
    it("should return true if the feature flag is enabled", () => {
      PropertiesMock.FEATURE_FLAG_SERVICE_WITHDRAWN_02102025 = "true";
      expect(isServiceWithdrawnFeatureEnabled()).toEqual(true);
    });

    it("should return false if the feature flag is disabled", () => {
      PropertiesMock.FEATURE_FLAG_SERVICE_WITHDRAWN_02102025 = "false";
      expect(isServiceWithdrawnFeatureEnabled()).toEqual(false);
    });
  });
});
