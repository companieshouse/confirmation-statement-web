const READABLE_COMPANY_STATUS = "Receiver Action";
const READABLE_COMPANY_TYPE = "Private limited company";
const KEY_RECEIVERSHIP = "receivership";
const KEY_LTD = "ltd";
const KEY = "key";
const SIC_CODE_KEY = "00011";
const SIC_CODE_DESCRIPTION = "Test sic-code description";

jest.mock("js-yaml", () => {
  return {
    load: jest.fn(() => {
      return {
        company_status: {
          [KEY_RECEIVERSHIP]: READABLE_COMPANY_STATUS,
        },
        company_type: {
          [KEY_LTD]: READABLE_COMPANY_TYPE,
        },
        sic_descriptions: {
          [SIC_CODE_KEY]: SIC_CODE_DESCRIPTION
        }
      };
    }),
  };
});

import { lookupCompanyStatus, lookupCompanyType, lookupSicCodeDescription } from "../../src/utils/api.enumerations";

describe("api enumeration tests", () => {

  it("should return a readable company type description when given a company type key", () => {
    const readableCompanyType: string = lookupCompanyType(KEY_LTD);
    expect(readableCompanyType).toEqual(READABLE_COMPANY_TYPE);
  });

  it("should return original key when there is no match for the company type key", () => {
    const readableCompanyType: string = lookupCompanyType(KEY);
    expect(readableCompanyType).toEqual(KEY);
  });

  it("should return a readable company status description when given a company status key", () => {
    const readableCompanyStatus: string = lookupCompanyStatus(KEY_RECEIVERSHIP);
    expect(readableCompanyStatus).toEqual(READABLE_COMPANY_STATUS);
  });

  it("should return original key when there is no match for the company status key", () => {
    const readableCompanyStatus: string = lookupCompanyStatus(KEY);
    expect(readableCompanyStatus).toEqual(KEY);
  });

  it("should return a readable company sic-code description when given a company sic-code", () => {
    const readableCompanyStatus: string = lookupSicCodeDescription(SIC_CODE_KEY);
    expect(readableCompanyStatus).toEqual(SIC_CODE_DESCRIPTION);
  });

  it("should return original sic-code when there is no match for the company sic-code", () => {
    const readableCompanyStatus: string = lookupSicCodeDescription(SIC_CODE_DESCRIPTION);
    expect(readableCompanyStatus).toEqual(SIC_CODE_DESCRIPTION);
  });
});
