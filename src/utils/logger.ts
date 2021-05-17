import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";

export const logger: ApplicationLogger = createLogger("Confirmation Statement Web");

export const logAndThrowError = (error: Error) => {
  logger.error(`${error.message} - ${error.stack}`);
  throw error;
};
