import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { Templates } from "../types/template.paths";

const pageNotFound = (req: Request, res: Response) => {
  return res.status(404).render(Templates.ERROR_404, { templateName: Templates.ERROR_404 });
};

/**
 * This handler catches any other error thrown within the application.
 * Use this error handler by calling next(e) from within a controller
 * Always keep this as the last handler in the chain for it to work.
 */
const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.errorRequest(req, `An error has occurred. Re-routing to the error screen - ${err.stack}`);
  res.status(500).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
};

export default [pageNotFound, errorHandler];
