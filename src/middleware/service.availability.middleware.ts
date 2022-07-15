import { NextFunction, Request, Response } from "express";
import { SHOW_SERVICE_OFFLINE_PAGE, EWF_URL } from "../utils/properties";
import { Templates } from "../types/template.paths";
import { isActiveFeature } from "../utils/feature.flag";
import { CONFIRMATION_STATEMENT, ACCESSIBILITY_STATEMENT } from "../types/page.urls";

const WHITELISTED_URLS: string[] = [
  `${CONFIRMATION_STATEMENT}${ACCESSIBILITY_STATEMENT}`,
  `${CONFIRMATION_STATEMENT}${ACCESSIBILITY_STATEMENT}/`
];

/**
 * Shows service offline page if config flag SHOW_SERVICE_OFFLINE_PAGE=true
 */
export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (isWhitelistedUrl(req.originalUrl)) {
    return next();
  }

  if (isActiveFeature(SHOW_SERVICE_OFFLINE_PAGE)) {
    return res.render(Templates.SERVICE_OFFLINE, {EWF_URL});
  }

  // feature flag SHOW_SERVICE_OFFLINE_PAGE is false - carry on as normal
  return next();
};

const isWhitelistedUrl = (url: string): boolean => WHITELISTED_URLS.includes(url);
