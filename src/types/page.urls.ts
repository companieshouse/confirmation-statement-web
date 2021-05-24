import { Templates } from "./template.paths";

export enum urlParams {
  PARAM_COMPANY_NUMBER = "companyNumber"
}

const SEPARATOR = "/";

export const ACCESSIBILITY_STATEMENT = SEPARATOR + Templates.ACCESSIBILITY_STATEMENT;
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const CONFIRMATION_STATEMENT = "/confirmation-statement";
export const COMPANY_NUMBER = "/company-number";
export const COMPANY_LOOKUP = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber={companyNumber}";
export const CONFIRM_COMPANY_PATH = CONFIRMATION_STATEMENT + CONFIRM_COMPANY;
export const COMPANY_AUTH_PROTECTED_BASE = `/company/:${urlParams.PARAM_COMPANY_NUMBER}/`;
export const TRADING_STATUS = COMPANY_AUTH_PROTECTED_BASE + "trading-status";
