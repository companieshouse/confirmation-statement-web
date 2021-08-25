export const STATEMENT_OF_CAPITAL_ERROR = "Select yes if the statement of capital is correct";
export const TRADING_STATUS_ERROR = "Select yes if the company trading status is correct";
export const SIC_CODE_ERROR = "Select yes if the SIC codes are correct";
export const DESCRIPTION = "Confirmation Statement Transaction";
export const REFERENCE = "ConfirmationStatementReference";
export const PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR = "Select yes if the PSC details are correct";
export const PSC_STATEMENT_CONTROL_ERROR = "Select yes if the company PSC Statement is correct";
export const REGISTERED_OFFICE_ADDRESS_ERROR = "Select yes if the Registered Office Address is correct";
export const DIRECTOR_DETAILS_ERROR = "Select yes if director details are correct";
export const SHAREHOLDERS_ERROR = "Select yes if the active shareholders are correct";
export const PSC_STATEMENT_NOT_FOUND = "No additional statements relating to PSCs are currently held on the public register.";
export const WRONG_DETAILS_UPDATE_PSC = "Update the people with significant control (PSC) details";
export const WRONG_DETAILS_INCORRECT_PSC = "Incorrect people with significant control - File a confirmation statement";
export const WRONG_DETAILS_UPDATE_DIRECTOR = "Update the director details";
export const WRONG_DETAILS_UPDATE_OFFICERS = "Update officers - File a confirmation statement";
export const PSC_STATEMENT_NAME_PLACEHOLDER = "{linked_psc_name}";


export const sessionCookieConstants = {
  ACTIVE_DIRECTOR_DETAILS_KEY: "activeDirectorDetails",
  PSC_STATEMENT_KEY: "pscStatement",
  REGISTERED_OFFICE_ADDRESS_KEY: "registeredOfficeAddress",
  STATEMENT_OF_CAPITAL_KEY: "statementOfCapital"
};

export enum RADIO_BUTTON_VALUE {
  NO = "no",
  YES = "yes",
  RECENTLY_FILED = "recently_filed"
}

export const taskKeys = {
  SECTION_STATUS_KEY: "sectionStatus"
};

export const appointmentTypes = {
  INDIVIDUAL_PSC: "5007",
  RLE_PSC: "5008",
  LEGAL_PERSON_PSC: "5009"
};

export const appointmentTypeNames = {
  PSC: "psc",
  RLE: "rle"
};

export enum SECTIONS {
  ACTIVE_DIRECTOR = "activeDirectorDetailsData",
  PSC = "personsSignificantControlData",
  ROA = "registeredOfficeAddressData",
  SIC = "sicCodeData",
  SOC = "statementOfCapitalData"
}

export const transactionStatus = {
  CLOSED: "closed"
};

export const headers = {
  PAYMENT_REQUIRED: "X-Payment-Required"
};
