import { Templates } from "./template.paths";

const SEPARATOR = "/";

export const ACCESSIBILITY_STATEMENT = "/accessibility-statement";
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const CONFIRMATION_STATEMENT = "/confirmation-statement";
export const COMPANY_NUMBER = "/company-number";
export const COMPANY_LOOKUP = "/company-lookup/search?forward=/confirmation-statement/confirm-company?companyNumber={companyNumber}";

export const CONFIRM_COMPANY_PATH = CONFIRMATION_STATEMENT + CONFIRM_COMPANY;
