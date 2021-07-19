import { Templates } from "./template.paths";

export enum urlParams {
  PARAM_COMPANY_NUMBER = "companyNumber",
  PARAM_TRANSACTION_ID = "transactionId",
  PARAM_SUBMISSION_ID = "submissionId"
}

const SEPARATOR = "/";

export const COMPANY_AUTH_PROTECTED_BASE = `/company/:${urlParams.PARAM_COMPANY_NUMBER}/`;
export const ACTIVE_SUBMISSION_BASE = COMPANY_AUTH_PROTECTED_BASE +
  `transaction/:${urlParams.PARAM_TRANSACTION_ID}/submission/:${urlParams.PARAM_SUBMISSION_ID}/`;

export const ACCESSIBILITY_STATEMENT = SEPARATOR + Templates.ACCESSIBILITY_STATEMENT;
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const CONFIRMATION_STATEMENT = "/confirmation-statement";
export const COMPANY_NUMBER = "/company-number";
export const COMPANY_LOOKUP = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber={companyNumber}";
export const CONFIRM_COMPANY_PATH = CONFIRMATION_STATEMENT + CONFIRM_COMPANY;
export const SIC = ACTIVE_SUBMISSION_BASE + "sic";
export const SIC_PATH = CONFIRMATION_STATEMENT + SIC;
export const CREATE_TRANSACTION = COMPANY_AUTH_PROTECTED_BASE + "transaction";
export const CREATE_TRANSACTION_PATH = CONFIRMATION_STATEMENT + CREATE_TRANSACTION;
export const TRADING_STATUS = ACTIVE_SUBMISSION_BASE + "trading-status";
export const TRADING_STATUS_PATH = CONFIRMATION_STATEMENT + TRADING_STATUS ;
export const TASK_LIST = ACTIVE_SUBMISSION_BASE + "task-list";
export const TASK_LIST_PATH = CONFIRMATION_STATEMENT + TASK_LIST;
export const STATEMENT_OF_CAPITAL = ACTIVE_SUBMISSION_BASE + "statement-of-capital";
export const STATEMENT_OF_CAPITAL_PATH = CONFIRMATION_STATEMENT + STATEMENT_OF_CAPITAL;
export const ACTIVE_PSCS = ACTIVE_SUBMISSION_BASE + "active-pscs";
export const ACTIVE_PSCS_PATH = CONFIRMATION_STATEMENT + ACTIVE_PSCS;
export const ACTIVE_OFFICERS = ACTIVE_SUBMISSION_BASE + "active-officers";
export const ACTIVE_OFFICERS_PATH = CONFIRMATION_STATEMENT + ACTIVE_OFFICERS;
export const REGISTERED_OFFICE_ADDRESS = ACTIVE_SUBMISSION_BASE + "registered-office-address";
export const REGISTERED_OFFICE_ADDRESS_PATH = CONFIRMATION_STATEMENT + REGISTERED_OFFICE_ADDRESS;
export const CHANGE_ROA_PATH = COMPANY_AUTH_PROTECTED_BASE + "change-registered-office-address";
