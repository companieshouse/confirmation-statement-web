import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";

const logger: ApplicationLogger = createLogger("Confirmation Statement Web");

export default logger;
