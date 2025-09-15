import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { router } from "./routes/routes";
import * as urls from "./types/page.urls";
import errorHandler from "./controllers/error.controller";
import { serviceAvailabilityMiddleware } from "./middleware/service.availability.middleware";
import { authenticationMiddleware } from "./middleware/authentication.middleware";
import { sessionMiddleware } from "./middleware/session.middleware";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger";
import { companyAuthenticationMiddleware } from "./middleware/company.authentication.middleware";
import { companyNumberQueryParameterValidationMiddleware } from "./middleware/company.number.validation.middleware";
import { isPscQueryParameterValidationMiddleware } from "./middleware/is.psc.validation.middleware";
import { transactionIdValidationMiddleware } from "./middleware/transaction.id.validation.middleware";
import { submissionIdValidationMiddleware } from "./middleware/submission.id.validation.middleware";
import { acspValidationMiddleware } from "./middleware/acsp.validation.middleware";
import { commonTemplateVariablesMiddleware } from "./middleware/common.variables.middleware";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { SessionStore } from "@companieshouse/node-session-handler";
import { getGOVUKFrontendVersion } from "@companieshouse/ch-node-utils";
import { CACHE_SERVER, COOKIE_NAME } from "./utils/properties";
import Redis from 'ioredis';

const app = express();
app.disable("x-powered-by");

//  view engine setup
const nunjucksEnv = nunjucks.configure([
  "views",
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/dist/",
  "node_modules/govuk-frontend/components/",
  "node_modules/@companieshouse/ch-node-utils/templates/",
  "node_modules/@companieshouse",
  "node_modules/accessible-autocomplete"
], {
  autoescape: true,
  express: app
});

nunjucksEnv.addGlobal("govukFrontendVersion", getGOVUKFrontendVersion());
nunjucksEnv.addGlobal("assetPath", process.env.CDN_HOST);
nunjucksEnv.addGlobal("PIWIK_URL", process.env.PIWIK_URL);
nunjucksEnv.addGlobal("PIWIK_SITE_ID", process.env.PIWIK_SITE_ID);
nunjucksEnv.addGlobal('govukRebrand', true);

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// support view in njk and html
app.engine("njk", nunjucks.render);
app.engine("html", nunjucks.render);

// apply middleware
app.use(cookieParser());
app.use(serviceAvailabilityMiddleware);

// validation middleware for url and query params - comapny number covered by companyAuthenticationMiddleware
// These need to run before companyAuthenticationMiddleware as that can log out full url
//  if auth value is invalid and url has invalid data in it
app.use(companyNumberQueryParameterValidationMiddleware);
app.use(isPscQueryParameterValidationMiddleware);
app.use(`*${urls.ACTIVE_SUBMISSION_BASE}`, transactionIdValidationMiddleware);
app.use(`*${urls.ACTIVE_SUBMISSION_BASE}`, submissionIdValidationMiddleware);

app.use(urls.middlewarePaths, sessionMiddleware);

const userAuthRegex = new RegExp("^" + urls.CONFIRMATION_STATEMENT + "/.+");
app.use(userAuthRegex, authenticationMiddleware);
app.use(`${urls.CONFIRMATION_STATEMENT}${urls.COMPANY_AUTH_PROTECTED_BASE}`, companyAuthenticationMiddleware);
app.use(urls.ACSP_LIMITED_PARTNERSHIP_PATH, acspValidationMiddleware);

// csrf middleware
const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));

const csrfProtectionMiddleware = CsrfProtectionMiddleware({
  sessionStore,
  enabled: true,
  sessionCookieName: COOKIE_NAME
});
app.use(urls.middlewarePaths, csrfProtectionMiddleware);

app.use(commonTemplateVariablesMiddleware);
// apply our default router to /confirmation-statement
app.use(urls.CONFIRMATION_STATEMENT, router);
app.use(errorHandler);

logger.info("Confirmation Statement Web has started");
export default app;
