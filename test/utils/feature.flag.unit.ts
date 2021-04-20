import { expect } from "chai";
import { isActiveFeature } from "../../src/utils/feature.flag";

describe("feature flag tests", function() {

  it("should return false if variable is 'false'", function() {
    const active = isActiveFeature("false");
    expect(active).to.be.not.ok;
  });

  it("should return false if variable is '0'", function() {
    const active = isActiveFeature("0");
    expect(active).to.be.not.ok;
  });

  it("should return false if variable is ''", function() {
    const active = isActiveFeature("");
    expect(active).to.be.not.ok;
  });

  it("should return false if variable is undefined", function() {
    const active = isActiveFeature(undefined);
    expect(active).to.be.not.ok;
  });

  it("should return true if variable is random", function() {
    const active = isActiveFeature("kdjhskjf");
    expect(active).to.be.ok;
  });

  it("should return false if variable is 'off'", function() {
    const active = isActiveFeature("off");
    expect(active).to.be.not.ok;
  });

  it("should return false if variable is 'OFF'", function() {
    const active = isActiveFeature("OFF");
    expect(active).to.be.not.ok;
  });

  it("should return true if variable is 'on'", function() {
    const active = isActiveFeature("on");
    expect(active).to.be.ok;
  });

  it("should return true if variable is 'true'", function() {
    const active = isActiveFeature("true");
    expect(active).to.be.ok;
  });

  it("should return true if variable is 'TRUE'", function() {
    const active = isActiveFeature("TRUE");
    expect(active).to.be.ok;
  });

  it("should return true if variable is '1'", function() {
    const active = isActiveFeature("1");
    expect(active).to.be.ok;
  });
});
