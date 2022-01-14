const READABLE_COMPANY_STATUS = "Receiver Action";
const READABLE_COMPANY_TYPE = "Private limited company";
const KEY_RECEIVERSHIP = "receivership";
const KEY_LTD = "ltd";
const KEY = "key";
const SIC_CODE_KEY = "00011";
const SIC_CODE_DESCRIPTION = "Test sic-code description";
const PSC_STATEMENT_KEY = "psc-details-not-confirmed";
const IDENTIFICATION_TYPE_KEY = "uk-limited-company";
const PSC_STATEMENT_DESCRIPTION = "Test psc-details-not-confirmed description";
const IDENTIFICATION_TYPE_DESCRIPTION = "UK Limited Company";

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
        },
        statement_description: {
          [PSC_STATEMENT_KEY]: PSC_STATEMENT_DESCRIPTION
        },
        identification_type: {
          [IDENTIFICATION_TYPE_KEY]: IDENTIFICATION_TYPE_DESCRIPTION
        },
      };
    }),
  };
});

import {
  lookupCompanyStatus,
  lookupCompanyType,
  lookupIdentificationType,
  lookupPscStatementDescription,
  lookupSicCodeDescription
} from "../../src/utils/api.enumerations";

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
    const readableSicCode: string = lookupSicCodeDescription(SIC_CODE_KEY);
    expect(readableSicCode).toEqual(SIC_CODE_DESCRIPTION);
  });

  it("should return original sic-code when there is no match for the company sic-code", () => {
    const readableSicCode: string = lookupSicCodeDescription(SIC_CODE_DESCRIPTION);
    expect(readableSicCode).toEqual(SIC_CODE_DESCRIPTION);
  });

  it("should return a readable psc statement description when given a psc statement key", () => {
    const readablePscStatement: string = lookupPscStatementDescription(PSC_STATEMENT_KEY);
    expect(readablePscStatement).toEqual(PSC_STATEMENT_DESCRIPTION);
  });

  it("should return original psc statement key when there is no match for the psc statement key", () => {
    const readablePscStatement: string = lookupPscStatementDescription(KEY);
    expect(readablePscStatement).toEqual(KEY);
  });

  it("should return an identification type description when given a identification type statement key", () => {
    const readableLookupIdentificationType: string = lookupIdentificationType(IDENTIFICATION_TYPE_KEY);
    expect(readableLookupIdentificationType).toEqual(IDENTIFICATION_TYPE_DESCRIPTION);
  });

  it("should return original identification type key when there is no match for the identification type key", () => {
    const readableLookupIdentificationType: string = lookupIdentificationType(KEY);
    expect(readableLookupIdentificationType).toEqual(KEY);
  });

  it("should return an empty string when the identification type key is empty", () => {
    const readableLookupIdentificationType: string = lookupIdentificationType("");
    expect(readableLookupIdentificationType).toEqual("");
  });
});
