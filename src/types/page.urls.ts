import { ACCOUNT_URL } from "../utils/properties";
import { Templates } from "./template.paths";

export enum urlParams {
  PARAM_COMPANY_NUMBER = "companyNumber",
  PARAM_TRANSACTION_ID = "transactionId",
  PARAM_SUBMISSION_ID = "submissionId"
}

export enum URL_QUERY_PARAM {
  COMPANY_NUM = "companyNumber",
  IS_PSC = "isPsc"
}

const SEPARATOR = "/";

export const COMPANY_AUTH_PROTECTED_BASE = `/company/:${urlParams.PARAM_COMPANY_NUMBER}/`;
export const ACTIVE_SUBMISSION_BASE = COMPANY_AUTH_PROTECTED_BASE +
  `transaction/:${urlParams.PARAM_TRANSACTION_ID}/submission/:${urlParams.PARAM_SUBMISSION_ID}/`;
export const CONTAINS_TRANSACTION_ID = `/transaction/:${urlParams.PARAM_TRANSACTION_ID}`;
export const CONTAINS_SUBMISSION_ID = `/submission/:${urlParams.PARAM_SUBMISSION_ID}`;


// Use _PATH consts for redirects
// Use const without _PATH to match the url in the routes.ts
export const ACCESSIBILITY_STATEMENT = SEPARATOR + Templates.ACCESSIBILITY_STATEMENT;
export const ACCOUNTS_SIGNOUT_PATH = `${ACCOUNT_URL}/signout`;
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const CONFIRMATION_STATEMENT = "/confirmation-statement";
export const COMPANY_NUMBER = "/company-number";
export const COMPANY_LOOKUP = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber={companyNumber}";
export const CONFIRM_COMPANY_PATH = CONFIRMATION_STATEMENT + CONFIRM_COMPANY;
export const PEOPLE_WITH_SIGNIFICANT_CONTROL = ACTIVE_SUBMISSION_BASE + Templates.PEOPLE_WITH_SIGNIFICANT_CONTROL;
export const PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH = CONFIRMATION_STATEMENT + PEOPLE_WITH_SIGNIFICANT_CONTROL;
export const ACTIVE_PSC_DETAILS = ACTIVE_SUBMISSION_BASE + Templates.ACTIVE_PSC_DETAILS;
export const ACTIVE_PSC_DETAILS_PATH = CONFIRMATION_STATEMENT + ACTIVE_PSC_DETAILS;
export const SHAREHOLDERS = ACTIVE_SUBMISSION_BASE + "shareholders";
export const SHAREHOLDERS_PATH = CONFIRMATION_STATEMENT + SHAREHOLDERS;
export const SIC = ACTIVE_SUBMISSION_BASE + "sic";
export const SIC_PATH = CONFIRMATION_STATEMENT + SIC;
export const SIGNOUT_PATH = "/signout";
export const CREATE_TRANSACTION = COMPANY_AUTH_PROTECTED_BASE + "transaction";
export const CREATE_TRANSACTION_PATH = CONFIRMATION_STATEMENT + CREATE_TRANSACTION;
export const TRADING_STATUS = ACTIVE_SUBMISSION_BASE + "trading-status";
export const TRADING_STATUS_PATH = CONFIRMATION_STATEMENT + TRADING_STATUS ;
export const TASK_LIST = ACTIVE_SUBMISSION_BASE + "task-list";
export const TASK_LIST_PATH = CONFIRMATION_STATEMENT + TASK_LIST;
export const STATEMENT_OF_CAPITAL = ACTIVE_SUBMISSION_BASE + "statement-of-capital";
export const STATEMENT_OF_CAPITAL_PATH = CONFIRMATION_STATEMENT + STATEMENT_OF_CAPITAL;
export const ACTIVE_OFFICERS = ACTIVE_SUBMISSION_BASE + "active-officers";
export const ACTIVE_OFFICERS_PATH = CONFIRMATION_STATEMENT + ACTIVE_OFFICERS;
export const ACTIVE_OFFICERS_DETAILS = ACTIVE_SUBMISSION_BASE + "active-officers-details";
export const ACTIVE_OFFICERS_DETAILS_PATH = CONFIRMATION_STATEMENT + ACTIVE_OFFICERS_DETAILS;
export const REGISTERED_OFFICE_ADDRESS = ACTIVE_SUBMISSION_BASE + "registered-office-address";
export const REGISTERED_OFFICE_ADDRESS_PATH = CONFIRMATION_STATEMENT + REGISTERED_OFFICE_ADDRESS;
export const REGISTERED_EMAIL_ADDRESS = ACTIVE_SUBMISSION_BASE + "registered-email-address";
export const REGISTER_LOCATIONS = ACTIVE_SUBMISSION_BASE + "register-locations";
export const REGISTER_LOCATIONS_PATH = CONFIRMATION_STATEMENT + REGISTER_LOCATIONS;
export const CHANGE_ROA_PATH = COMPANY_AUTH_PROTECTED_BASE + "change-registered-office-address";
export const PSC_STATEMENT = ACTIVE_SUBMISSION_BASE + Templates.PSC_STATEMENT;
export const PSC_STATEMENT_PATH = CONFIRMATION_STATEMENT + PSC_STATEMENT + `?${URL_QUERY_PARAM.IS_PSC}={${URL_QUERY_PARAM.IS_PSC}}`;
export const REVIEW = ACTIVE_SUBMISSION_BASE + "review";
export const REVIEW_PATH = CONFIRMATION_STATEMENT + REVIEW;
export const CONFIRMATION = ACTIVE_SUBMISSION_BASE + "confirmation";
export const CONFIRMATION_PATH = CONFIRMATION_STATEMENT + CONFIRMATION;
export const PAYMENT_CALLBACK = ACTIVE_SUBMISSION_BASE + "payment-callback";
export const PAYMENT_CALLBACK_PATH = CONFIRMATION_STATEMENT + PAYMENT_CALLBACK;
export const INVALID_COMPANY_STATUS = "/invalid-company-status";
export const INVALID_COMPANY_STATUS_PATH = CONFIRMATION_STATEMENT + INVALID_COMPANY_STATUS + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const USE_PAPER = "/paper-filing";
export const USE_PAPER_PATH = CONFIRMATION_STATEMENT + USE_PAPER + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const USE_WEBFILING = "/use-webfiling";
export const USE_WEBFILING_PATH = CONFIRMATION_STATEMENT + USE_WEBFILING + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const NO_FILING_REQUIRED = "/no-filing-required";
export const NO_FILING_REQUIRED_PATH = CONFIRMATION_STATEMENT + NO_FILING_REQUIRED + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const TRADING_STOP = ACTIVE_SUBMISSION_BASE + Templates.TRADING_STOP;
export const TRADING_STOP_PATH = CONFIRMATION_STATEMENT + TRADING_STOP;
export const WRONG_SIC = ACTIVE_SUBMISSION_BASE + Templates.WRONG_SIC;
export const WRONG_SIC_PATH = CONFIRMATION_STATEMENT + WRONG_SIC;
export const WRONG_STATEMENT_OF_CAPITAL = ACTIVE_SUBMISSION_BASE + Templates.WRONG_STATEMENT_OF_CAPITAL;
export const WRONG_STATEMENT_OF_CAPITAL_PATH = CONFIRMATION_STATEMENT + WRONG_STATEMENT_OF_CAPITAL;
export const WRONG_SHAREHOLDERS = ACTIVE_SUBMISSION_BASE + Templates.WRONG_SHAREHOLDERS;
export const WRONG_SHAREHOLDERS_PATH = CONFIRMATION_STATEMENT + WRONG_SHAREHOLDERS;
export const WRONG_RO =  ACTIVE_SUBMISSION_BASE + Templates.WRONG_RO;
export const WRONG_RO_PATH = CONFIRMATION_STATEMENT + WRONG_RO;
export const WRONG_REGISTER_LOCATIONS = ACTIVE_SUBMISSION_BASE + Templates.WRONG_REGISTER_LOCATIONS;
export const WRONG_REGISTER_LOCATIONS_PATH = CONFIRMATION_STATEMENT + WRONG_REGISTER_LOCATIONS;
export const WRONG_OFFICER_DETAILS = ACTIVE_SUBMISSION_BASE + "incorrect-information/wrong-officer-details";
export const WRONG_OFFICER_DETAILS_PATH = CONFIRMATION_STATEMENT + WRONG_OFFICER_DETAILS;
export const WRONG_PSC_DETAILS = ACTIVE_SUBMISSION_BASE + "incorrect-information/wrong-psc-details";
export const WRONG_PSC_DETAILS_PATH = CONFIRMATION_STATEMENT + WRONG_PSC_DETAILS;
export const WRONG_PSC_STATEMENT = ACTIVE_SUBMISSION_BASE + "incorrect-information/wrong-psc-statement";
export const WRONG_PSC_STATEMENT_PATH = CONFIRMATION_STATEMENT + WRONG_PSC_STATEMENT;
