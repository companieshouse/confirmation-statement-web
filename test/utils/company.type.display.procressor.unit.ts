import { editCompanyTypeDisplay } from "../../src/utils/company.type.display.procressor";

describe("company type display processing tests", () => {
  it ("should return value where wording is same as the key", () => {
    const processed: string = editCompanyTypeDisplay("industrial-and-provident-society", "Industrial and Provident Society");
    expect(processed).toEqual("Industrial And Provident Society");
  });

  it ("should retain forward slash post processing", () => {
    const processed: string = editCompanyTypeDisplay("converted-or-closed", "Converted/closed company");
    expect(processed).toEqual("Converted/closed");
  });

  it ("should remove excess words not present in type key", () => {
    const processed: string = editCompanyTypeDisplay("scottish-partnership", "Scottish qualifying partnership");
    expect(processed).toEqual("Scottish Partnership");
  });

  it ("should process even when no value is present for the key", () => {
    const processed: string = editCompanyTypeDisplay("united-kingdom-societas", "united-kingdom-societas");
    expect(processed).toEqual("United Kingdom Societas");
  });

  it ("should return value when present for abbreviated key", () => {
    let processed: string = editCompanyTypeDisplay("ltd", "Private limited Company");
    expect(processed).toEqual("Private limited Company");
    processed = editCompanyTypeDisplay("plc", "Public limited Company");
    expect(processed).toEqual("Public limited Company");
    processed = editCompanyTypeDisplay("llp", "Limited liability partnership");
    expect(processed).toEqual("Limited liability partnership");
    processed = editCompanyTypeDisplay("icvc-securities", "Investment company with variable capital");
    expect(processed).toEqual("Investment company with variable capital");
    processed = editCompanyTypeDisplay("icvc-warrant", "Investment company with variable capital");
    expect(processed).toEqual("Investment company with variable capital");
    processed = editCompanyTypeDisplay("icvc-umbrella", "Investment company with variable capital");
    expect(processed).toEqual("Investment company with variable capital");
  });
});
