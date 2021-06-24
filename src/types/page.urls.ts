import { Templates } from "./template.paths";

export enum urlParams {
  PARAM_COMPANY_NUMBER = "companyNumber"
}

const SEPARATOR = "/";

export const COMPANY_AUTH_PROTECTED_BASE = `/company/:${urlParams.PARAM_COMPANY_NUMBER}/`;

export const ACCESSIBILITY_STATEMENT = SEPARATOR + Templates.ACCESSIBILITY_STATEMENT;
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const CONFIRMATION_STATEMENT = "/confirmation-statement";
export const COMPANY_NUMBER = "/company-number";
export const COMPANY_LOOKUP = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber={companyNumber}";
export const CONFIRM_COMPANY_PATH = CONFIRMATION_STATEMENT + CONFIRM_COMPANY;
export const SIC = COMPANY_AUTH_PROTECTED_BASE + "sic";
export const SIC_PATH = CONFIRMATION_STATEMENT + SIC;
export const TRADING_STATUS = COMPANY_AUTH_PROTECTED_BASE + "trading-status";
export const TRADING_STATUS_PATH = CONFIRMATION_STATEMENT + TRADING_STATUS ;
export const TASK_LIST = COMPANY_AUTH_PROTECTED_BASE + "task-list";
export const TASK_LIST_PATH = CONFIRMATION_STATEMENT + TASK_LIST;
export const ACTIVE_PSCS = COMPANY_AUTH_PROTECTED_BASE + "active-pscs";
export const ACTIVE_PSCS_PATH = CONFIRMATION_STATEMENT + ACTIVE_PSCS;
export const STATEMENT_OF_CAPITAL = COMPANY_AUTH_PROTECTED_BASE + "statement-of-capital";
export const STATEMENT_OF_CAPITAL_PATH = CONFIRMATION_STATEMENT + STATEMENT_OF_CAPITAL;
