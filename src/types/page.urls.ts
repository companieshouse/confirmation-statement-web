import { Templates } from "./template.paths";

const SEPARATOR = "/";

export const ACCESSIBILITY_STATEMENT = SEPARATOR + Templates.ACCESSIBILITY_STATEMENT;
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const CONFIRMATION_STATEMENT = "/confirmation-statement";
export const COMPANY_NUMBER = "/company-number";
export const COMPANY_LOOKUP = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber={companyNumber}";

export const CONFIRM_COMPANY_PATH = CONFIRMATION_STATEMENT + CONFIRM_COMPANY;

// Company Auth protected routes
export const COMPANY_AUTH_PROTECTED_BASE = "/company/:companyNumber/";

export const TRADING_STATUS = COMPANY_AUTH_PROTECTED_BASE + "trading-status";
